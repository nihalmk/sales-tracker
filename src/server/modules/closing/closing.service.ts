import { ClosingModel, Closing } from './closing.model';
import { CreateClosingInput, UpdateClosingInput } from './closing.input';
import { CTX } from '../../interfaces/common';
import { UserService } from '../user/user.service';
import _ from 'lodash';
import { ItemsService } from '../items/items.service';
import { SaleService } from '../sale/sale.service';
import { PurchaseService } from '../purchase/purchase.service';
import moment from 'moment-timezone';

// Queries on models to to get/create/update closing data

export class ClosingService {
  readonly model: typeof ClosingModel;
  readonly ctx: CTX;
  readonly userService: UserService;
  readonly itemsService: ItemsService;
  readonly saleService: SaleService;
  readonly purchaseService: PurchaseService;

  constructor(ctx: CTX) {
    this.model = ClosingModel;
    this.ctx = ctx;
    this.userService = new UserService();
    this.itemsService = new ItemsService(ctx);
    this.saleService = new SaleService(ctx);
    this.purchaseService = new PurchaseService(ctx);
  }

  async getClosingByClosingId(closingId: string): Promise<Closing[]> {
    return this.model.find({
      shop: this.ctx.user.shop,
      closingId: new RegExp(closingId, 'g'),
    });
  }

  async getClosings(date: { from: Date; to: Date }): Promise<Closing[]> {
    return this.model.find({
      shop: this.ctx.user.shop,
      date: {
        $gte: date.from,
        $lte: date.to,
      },
    });
  }

  // Shared by draft-save and finalize — both reflect the exact same live
  // totals; only `active` (and whether tagging happens) differs.
  private async computeTotals(
    closing: CreateClosingInput,
    previousClosing: Closing | null,
  ): Promise<{ inHandTotal: number; spentTotal: number }> {
    const sales = await this.saleService.getSalesByIds(closing.salesIds || []);
    const purchases = await this.purchaseService.getPurchasesByIds(
      closing.purchaseIds || [],
    );
    const receivedItemsTotal = _.sum(
      closing.receivedItems?.map((s) => s.amount),
    );
    const salesTotal = _.sum(sales?.map((s) => s.total));
    const purchaseTotal = _.sum(purchases?.map((s) => s.total));
    const spentTotal = _.sum(closing.spentItems?.map((s) => s.amount));
    const inHandTotal =
      (previousClosing?.inHandTotal || 0) +
      salesTotal +
      receivedItemsTotal -
      (purchaseTotal + spentTotal);
    return { inHandTotal, spentTotal };
  }

  // The shop's single in-progress closing, if one exists — there's never
  // more than one draft at a time; saving again reuses it instead of
  // creating a second one.
  async getDraftClosing(): Promise<Closing | null> {
    return this.model.findOne({
      shop: this.ctx.user.shop,
      active: false,
    });
  }

  // Create a new closing

  async createClosing(closing: CreateClosingInput): Promise<Closing> {
    const previousClosing = await this.getPreviousClosing();
    const { inHandTotal, spentTotal } = await this.computeTotals(
      closing,
      previousClosing,
    );

    const fields: Partial<Closing> = {
      sales: closing.salesIds || [],
      purchases: closing.purchaseIds || [],
      spentItems: closing.spentItems || [],
      receivedItems: closing.receivedItems || [],
      inHandTotal,
      spentTotal,
      active: closing.active,
      // A draft keeps the date it was opened with (just a label while it's
      // still being assembled); finalizing stamps the actual moment it's
      // locked in — not the backlog's start date, which is what
      // `closing.date` holds when a multi-day backlog is being closed at
      // once.
      date: closing.active ? new Date() : closing.date,
    };

    const existingDraft = await this.getDraftClosing();
    // Finalizing with no draft to upsert into means a brand-new document
    // would be created — guard against a double-submit (double-click,
    // retry) doing this twice in a row and silently splitting today's
    // ledger into two separate active closings.
    if (
      closing.active &&
      !existingDraft &&
      previousClosing &&
      moment().isSame(previousClosing.date, 'day')
    ) {
      throw new Error('A closing has already been finalized for today.');
    }
    const savedClosing = existingDraft
      ? await this.model.findOneAndUpdate(
          { _id: existingDraft._id },
          { $set: fields },
          { new: true },
        )
      : await this.model.create({
          ...fields,
          shop: closing.shop || this.ctx.user.shop,
        });

    if (closing.active) {
      await this.saleService.markSalesClosed(
        closing.salesIds || [],
        savedClosing._id,
      );
      await this.purchaseService.markPurchasesClosed(
        closing.purchaseIds || [],
        savedClosing._id,
      );
    }

    return savedClosing;
  }

  async updateClosing(closing: UpdateClosingInput): Promise<Closing> {
    const _id = closing._id;
    const existing = await this.model.findOne({
      _id,
      shop: this.ctx.user.shop,
    });
    if (!existing) {
      return null;
    }
    if (existing.active) {
      throw new Error(
        'This closing has already been finalized and cannot be edited.',
      );
    }
    const updateClosing = await this.model.findOneAndUpdate(
      {
        _id,
        shop: this.ctx.user.shop,
      },
      {
        $set: {
          ..._.omit(closing, ['_id']),
        },
      },
      {
        new: true,
      },
    );
    return updateClosing;
  }

  // Only a *finalized* closing is a real checkpoint — a draft (active:
  // false) is still being assembled and must never be mistaken for one,
  // here or anywhere else this feeds into (dashboard's "is today closed"
  // gate, the carry-forward inHandTotal shown while drafting, and the
  // sale/purchase edit-lock watermark).
  async getPreviousClosing(): Promise<Closing> {
    const closing = await this.model
      .find({
        shop: this.ctx.user.shop,
        active: true,
      })
      .sort({ date: -1 })
      .limit(1);
    return closing[0];
  }

  // Distinct "Spent On" / "Received For" labels used across every past
  // closing — powers the creatable select on the New Closing form so
  // recurring categories (rent, electricity, loan repayment, ...) can be
  // picked instead of retyped each time.
  async getSpentCategories(): Promise<string[]> {
    const categories: string[] = await this.model.distinct(
      'spentItems.spentOn',
      { shop: this.ctx.user.shop, 'spentItems.spentOn': { $nin: [null, ''] } },
    );
    return categories.sort((a, b) => a.localeCompare(b));
  }

  async getReceivedCategories(): Promise<string[]> {
    const categories: string[] = await this.model.distinct(
      'receivedItems.receivedFor',
      {
        shop: this.ctx.user.shop,
        'receivedItems.receivedFor': { $nin: [null, ''] },
      },
    );
    return categories.sort((a, b) => a.localeCompare(b));
  }
}
