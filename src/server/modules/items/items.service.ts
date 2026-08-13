import { ItemsModel, Items, PaginatedItems } from './items.model';
import { CreateItemsInput, UpdateItemsInput } from './items.input';
import { CTX } from '../../interfaces/common';
import { UserService } from '../user/user.service';
import _ from 'lodash';
import { SaleItemInput } from '../sale/sale.input';
import { PurchaseItemInput } from '../purchase/purchase.input';
import { ObjectId } from 'mongodb';

// Queries on models to to get/create/update items data

export class ItemsService {
  readonly model: typeof ItemsModel;
  readonly ctx: CTX;
  readonly userService: UserService;

  constructor(ctx: CTX) {
    this.model = ItemsModel;
    this.ctx = ctx;
    this.userService = new UserService();
  }

  // get Items by given id

  async getItemById(id: ObjectId): Promise<Items> {
    return this.model
      .findOne({
        shop: this.ctx.user.shop,
        _id: id,
      })
      .populate('shop');
  }

  // get all Items of shop. limit=0 means "no pagination, return everything
  // matching" — used by embedded callers (e.g. the product picker on
  // AddSale/AddPurchase) that need the complete list, not just one page.
  async getItems(
    search?: string,
    page = 1,
    limit = 0,
  ): Promise<PaginatedItems> {
    const filter: Record<string, unknown> = { shop: this.ctx.user.shop };
    if (search) {
      filter.$or = [
        { name: new RegExp(search, 'i') },
        { shortId: new RegExp(search, 'i') },
      ];
    }

    let query = this.model.find(filter).sort({ name: 1 }).populate('shop');
    if (limit > 0) {
      query = query.skip((page - 1) * limit).limit(limit);
    }

    const [items, totalCount, aggregate] = await Promise.all([
      query,
      this.model.countDocuments(filter),
      this.model.aggregate([
        { $match: filter },
        {
          $group: {
            _id: null,
            totalStockAmount: {
              $sum: { $multiply: ['$price.cost', '$stock'] },
            },
          },
        },
      ]),
    ]);
    const totals = aggregate[0] || { totalStockAmount: 0 };
    return {
      items,
      totalCount,
      totalStockAmount: totals.totalStockAmount,
    };
  }

  // Create a new items

  async createItem(item: CreateItemsInput): Promise<Items> {
    const createdItem = await this.model.create({
      ...item,
      shop: item.shop || this.ctx.user.shop,
    });
    return createdItem;
  }

  async updateItems(item: UpdateItemsInput): Promise<Items> {
    const _id = item._id;
    const updateItems = await this.model.findOneAndUpdate(
      {
        _id,
        shop: this.ctx.user.shop,
      },
      {
        $set: {
          ..._.omit(item, ['_id']),
        },
      },
      {
        new: true,
      },
    );
    return updateItems;
  }

  async updateStock(items: SaleItemInput[]): Promise<void> {
    for (const item of items) {
      const inStockItem = await this.model.findById(item.item);
      if (inStockItem.stock !== -1) {
        await this.model.updateOne(
          {
            _id: item.item,
          },
          {
            $set: {
              stock: inStockItem.stock - item.quantity,
            },
          },
        );
      }
    }
  }

  async updateStockWithPurchase(items: PurchaseItemInput[]): Promise<void> {
    for (const item of items) {
      const inStockItem = await this.model.findById(item.item);
      if (inStockItem.stock !== -1) {
        await this.model.updateOne(
          {
            _id: item.item,
          },
          {
            $set: {
              stock: inStockItem.stock + item.quantity,
              price: {
                list: inStockItem.price.list,
                sale: item.sale || inStockItem.price.sale,
                cost: item.cost || inStockItem.price.cost,
              },
            },
          },
        );
      }
    }
  }
}
