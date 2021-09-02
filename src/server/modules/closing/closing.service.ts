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

  // Create a new closing

  async createClosing(closing: CreateClosingInput): Promise<Closing> {
    // TODO: use shop timezone
    const previousClosing = await this.getPreviousClosing();
    let closingObj: Partial<Closing> = {};
    if (!closing.active) {
      closingObj = {
        sales: [],
        spentItems: [],
        receivedItems: [],
        inHandTotal: previousClosing
          ? previousClosing.inHandTotal
          : closing.inHandTotal || 0,
        spentTotal: previousClosing
          ? previousClosing.spentTotal
          : closing.spentTotal || 0,
        date: closing.date,
        active: false,
      };
    } else {
      const sales = await this.saleService.getSalesByIds(closing.salesIds);
      const purchases = await this.purchaseService.getPurchasesByIds(
        closing.salesIds,
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

      closingObj = {
        sales: closing.salesIds,
        spentItems: closing.spentItems,
        receivedItems: closing.receivedItems,
        inHandTotal: inHandTotal,
        spentTotal: spentTotal,
        date: closing.date,
        active: true,
      };
    }
    const createdClosing = await this.model.create({
      ...closingObj,
      shop: closing.shop || this.ctx.user.shop,
    });
    // TODO: use shop timezone
    const dateRange = {
      from: moment(closing.date).startOf('day').toDate(),
      to: moment(closing.date).endOf('day').toDate(),
    };
    this.saleService.updateClosing(dateRange, createdClosing._id);
    this.purchaseService.updateClosing(dateRange, createdClosing._id);
    return createdClosing;
  }

  async updateClosing(closing: UpdateClosingInput): Promise<Closing> {
    const _id = closing._id;
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

  async getPreviousClosing(): Promise<Closing> {
    const closing = await this.model
      .find({
        shop: this.ctx.user.shop,
      })
      .sort({ date: -1 })
      .limit(1);
    return closing[0];
  }
}
