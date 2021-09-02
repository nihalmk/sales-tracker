import { PurchaseModel, Purchase } from './purchase.model';
import { CreatePurchaseInput, UpdatePurchaseInput } from './purchase.input';
import { CTX } from '../../interfaces/common';
import { UserService } from '../user/user.service';
import _ from 'lodash';
import { Items } from '../items/items.model';
import { ItemsService } from '../items/items.service';
import { ObjectId } from 'mongodb';
import { DateRange } from '../common/Types/InputTypes';

// Queries on models to to get/create/update purchase data

export class PurchaseService {
  readonly model: typeof PurchaseModel;
  readonly ctx: CTX;
  readonly userService: UserService;
  readonly itemsService: ItemsService;

  constructor(ctx: CTX) {
    this.model = PurchaseModel;
    this.ctx = ctx;
    this.userService = new UserService();
    this.itemsService = new ItemsService(ctx);
  }

  async getPurchaseByBillNumber(billNumber: string): Promise<Purchase[]> {
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

  async getPurchaseByVendorName(vendor: string): Promise<Purchase[]> {
    return this.model
      .find({
        shop: this.ctx.user.shop,
        vendor: new RegExp(vendor, 'g'),
      })
      .populate('shop')
      .populate({
        path: 'items.item',
        model: Items,
      });
  }

  async getPurchaseByVendorPhone(contact: string): Promise<Purchase[]> {
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

  async getPurchases(date: { from: Date; to: Date }): Promise<Purchase[]> {
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

  async getPurchasesByIds(ids: ObjectId[]): Promise<Purchase[]> {
    return this.model.find({
      _id: {
        $in: ids,
      },
    });
  }

  // Create a new purchase

  async createPurchase(purchase: CreatePurchaseInput): Promise<Purchase> {
    for (const item of purchase.items) {
      const itemFromDb = await this.itemsService.getItemById(item.item);
      // if the new purchased product has a different cost than existing one, create a new item with new cost
      if (itemFromDb.price.cost !== item.cost) {
        const newItem = await this.itemsService.createItem({
          name: itemFromDb.name,
          category: itemFromDb.category,
          price: {
            ...itemFromDb.price,
            cost: item.cost,
            sale: item.sale,
          },
          stock: 0,
        });
        item.item = newItem._id;
      }
    }
    const createdPurchase = await this.model.create({
      ...purchase,
      shop: purchase.shop || this.ctx.user.shop,
    });
    await this.itemsService.updateStockWithPurchase(purchase.items);
    return createdPurchase;
  }

  async updatePurchase(purchase: UpdatePurchaseInput): Promise<Purchase> {
    const _id = purchase._id;
    const updatePurchase = await this.model.findOneAndUpdate(
      {
        _id,
        shop: this.ctx.user.shop,
      },
      {
        $set: {
          ..._.omit(purchase, ['_id']),
        },
      },
      {
        new: true,
      },
    );
    return updatePurchase;
  }

  async getLastPurchase(): Promise<Purchase> {
    const purchase = await this.model
      .find({
        shop: this.ctx.user.shop,
      })
      .sort({ createdAt: -1 })
      .limit(1);
    return purchase[0];
  }

  async getPurchaseWithoutClosing(): Promise<Purchase[]> {
    return await this.model.find({
      shop: this.ctx.user.shop,
      closing: {
        $exists: false,
      },
    });
  }

  async updateClosing(date: DateRange, closingId: ObjectId): Promise<void> {
    await this.model.updateMany(
      {
        createdAt: {
          $gte: date.from,
          $lte: date.to,
        },
      },
      {
        $set: {
          closing: closingId,
        },
      },
    );
  }
}
