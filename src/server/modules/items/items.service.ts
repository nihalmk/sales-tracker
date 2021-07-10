import { ItemsModel, Items } from './items.model';
import { CreateItemsInput, UpdateItemsInput } from './items.input';
import { CTX } from '../../interfaces/common';
import { UserService } from '../user/user.service';
import _ from 'lodash';
import { SaleItemInput } from '../sale/sale.input';
import { PurchaseItemInput } from '../purchase/purchase.input';

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

  async getItems(): Promise<Items[]> {
    return this.model
      .find({
        shop: this.ctx.user.shop,
      })
      .populate('shop');
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
