import { SaleModel, Sale } from './sale.model';
import { CreateSaleInput, UpdateSaleInput } from './sale.input';
import { CTX } from '../../interfaces/common';
import { UserService } from '../user/user.service';
import _ from 'lodash';
import { Items } from '../items/items.model';
import { ItemsService } from '../items/items.service';
import { ObjectId } from 'mongodb';

// Queries on models to to get/create/update sale data

export class SaleService {
  readonly model: typeof SaleModel;
  readonly ctx: CTX;
  readonly userService: UserService;
  readonly itemsService: ItemsService;

  constructor(ctx: CTX) {
    this.model = SaleModel;
    this.ctx = ctx;
    this.userService = new UserService();
    this.itemsService = new ItemsService(ctx);
  }

  async getSaleByBillNumber(billNumber: string): Promise<Sale[]> {
    return this.model
      .find({
        shop: this.ctx.user.shop,
        billNumber: new RegExp(billNumber, 'g'),
      })
      .populate('shop')
      .populate({
        path: 'items.item',
        model: Items,
      });
  }

  async getSaleByCustomerName(customer: string): Promise<Sale[]> {
    return this.model
      .find({
        shop: this.ctx.user.shop,
        customer: new RegExp(customer, 'g'),
      })
      .populate('shop')
      .populate({
        path: 'items.item',
        model: Items,
      });
  }

  async getSaleByCustomerPhone(contact: string): Promise<Sale[]> {
    return this.model
      .find({
        shop: this.ctx.user.shop,
        contact: new RegExp(contact, 'g'),
      })
      .populate('shop')
      .populate({
        path: 'items.item',
        model: Items,
      });
  }

  async getSales(date: { from: Date; to: Date }): Promise<Sale[]> {
    return this.model
      .find({
        shop: this.ctx.user.shop,
        createdAt: {
          $gte: date.from,
          $lte: date.to,
        },
      })
      .populate('shop')
      .populate({
        path: 'items.item',
        model: Items,
      });
  }

  async getSalesByIds(ids: ObjectId[]): Promise<Sale[]> {
    return this.model
      .find({
        _id: {
          $in: ids
        },
      });
  }

  // Create a new sale

  async createSale(sale: CreateSaleInput): Promise<Sale> {
    const createdSale = await this.model.create({
      ...sale,
      shop: sale.shop || this.ctx.user.shop,
    });
    await this.itemsService.updateStock(sale.items);
    return createdSale;
  }

  async updateSale(sale: UpdateSaleInput): Promise<Sale> {
    const _id = sale._id;
    const updateSale = await this.model.findOneAndUpdate(
      {
        _id,
        shop: this.ctx.user.shop,
      },
      {
        $set: {
          ..._.omit(sale, ['_id']),
        },
      },
      {
        new: true,
      },
    );
    return updateSale;
  }
}
