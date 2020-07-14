import { ClosingModel, Closing } from './closing.model';
import { CreateClosingInput, UpdateClosingInput } from './closing.input';
import { CTX } from '../../interfaces/common';
import { UserService } from '../user/user.service';
import _ from 'lodash';
import { ItemsService } from '../items/items.service';
import moment from 'moment-timezone';
import { SaleService } from '../sale/sale.service';
import { PurchaseService } from '../purchase/purchase.service';

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
  }

  async getClosingByClosingId(closingId: string): Promise<Closing[]> {
    return this.model
      .find({
        shop: this.ctx.user.shop,
        closingId: new RegExp(closingId, 'g'),
      })
  }

  async getClosings(date: { from: Date; to: Date }): Promise<Closing[]> {
    return this.model
      .find({
        shop: this.ctx.user.shop,
        createdAt: {
          $gte: date.from,
          $lte: date.to,
        },
      })
  }

  // Create a new closing

  async createClosing(closing: CreateClosingInput): Promise<Closing> {
    const previousClosing = (await this.getClosings({
      from: moment().subtract(1, 'days').toDate(),
      to: moment().subtract(1, 'days').toDate()
    }))[0]
    let closingObj: Partial<Closing> = {};
    if (!closing.active) {
      closingObj = {
        sales: [],
        spentItems: [],
        receivedItems: [],
        inHandTotal: previousClosing ? previousClosing.inHandTotal : 0,
        spentTotal: previousClosing ? previousClosing.spentTotal : 0,
        active: false
      }
    } else {
      const sales = await this.saleService.getSalesByIds(closing.salesIds);
      const purchases = await this.purchaseService.getPurchasesByIds(closing.salesIds);

      const receivedItemsTotal = _.sum(closing.receivedItems.map(s => s.amount))
      const salesTotal = _.sum(sales.map(s => s.total))
      const purchaseTotal = _.sum(purchases.map(s => s.total))

      const spentTotal = _.sum(closing.spentItems.map(s => s.amount));

      const inHandTotal = (salesTotal + receivedItemsTotal) - (purchaseTotal + spentTotal);

      closingObj = {
        sales: closing.salesIds,
        spentItems: closing.spentItems,
        receivedItems: closing.receivedItems,
        inHandTotal: inHandTotal,
        spentTotal: spentTotal,
        active: true
      }
    }
    const createdClosing = await this.model.create({
      ...closingObj,
      shop: closing.shop || this.ctx.user.shop,
    });
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
}
