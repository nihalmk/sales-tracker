import {
  ItemsModel,
  Items,
  PaginatedItems,
  BulkUpdateItemsResult,
} from './items.model';
import {
  CreateItemsInput,
  UpdateItemsInput,
  BulkUpdateItemInput,
} from './items.input';
import { CTX } from '../../interfaces/common';
import { UserService } from '../user/user.service';
import _ from 'lodash';
import { SaleItemInput } from '../sale/sale.input';
import { PurchaseItemInput } from '../purchase/purchase.input';
import { ObjectId } from 'mongodb';
import { guessCategory } from './autoCategorize';

// Queries on models to to get/create/update items data

// Case-insensitive exact match — anchored so "Snack" doesn't also match
// "Snacks", and the input is escaped so regex metacharacters in a real
// category name are matched literally, not as regex syntax.
const exactCaseInsensitive = (value: string) =>
  new RegExp(`^${_.escapeRegExp(value)}$`, 'i');

// Sums quantity per item id — items are looked up by id fresh (not
// populated), so `String(item.item)` is always the plain ObjectId hex
// string, whether it came from a pre-edit Mongoose subdocument or a
// freshly-submitted input.
const sumQuantitiesByItemId = (
  items: { item: unknown; quantity: number }[],
): Map<string, number> => {
  const map = new Map<string, number>();
  for (const i of items || []) {
    const id = String(i.item);
    map.set(id, (map.get(id) || 0) + i.quantity);
  }
  return map;
};

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
    category?: string,
  ): Promise<PaginatedItems> {
    const filter: Record<string, unknown> = { shop: this.ctx.user.shop };
    if (search) {
      filter.$or = [
        { name: new RegExp(search, 'i') },
        { shortId: new RegExp(search, 'i') },
      ];
    }
    if (category) {
      filter.category = exactCaseInsensitive(category);
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

  // Distinct categories already used by this shop's items — for filter and
  // creatable-select dropdowns.
  async getCategories(): Promise<string[]> {
    const categories = await this.model.distinct('category', {
      shop: this.ctx.user.shop,
      category: { $nin: [null, ''] },
    });
    return categories.sort((a: string, b: string) => a.localeCompare(b));
  }

  // Create a new items

  async createItem(item: CreateItemsInput): Promise<Items> {
    const createdItem = await this.model.create({
      ...item,
      // Only guessed when the user didn't pick one themselves — never
      // overrides an explicit choice.
      category: item.category || guessCategory(item.name),
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

  // CSV bulk update, matched by shortId — only ever touches
  // category/price/stock/imageUrls (BulkUpdateItemInput has no `name`
  // field at all, so there's nothing else it could touch). The client
  // sends this in small batches for a real, incremental progress bar; each
  // row here is independent, so one bad row never blocks the rest of the
  // batch.
  async bulkUpdateByShortId(
    rows: BulkUpdateItemInput[],
  ): Promise<BulkUpdateItemsResult> {
    const updated: Items[] = [];
    const notFound: string[] = [];
    const errors: { shortId: string; message: string }[] = [];

    for (const row of rows) {
      const shortId = row.shortId?.trim();
      if (!shortId) {
        errors.push({
          shortId: row.shortId || '(blank)',
          message: 'Missing Short ID',
        });
        continue;
      }
      if (row.stock !== undefined && row.stock < -1) {
        errors.push({ shortId, message: 'Stock must be -1 or greater' });
        continue;
      }
      if (
        row.price &&
        ((row.price.cost !== undefined && row.price.cost < 0) ||
          (row.price.list !== undefined && row.price.list < 0) ||
          (row.price.sale !== undefined && row.price.sale < 0))
      ) {
        errors.push({ shortId, message: 'Prices cannot be negative' });
        continue;
      }

      const existing = await this.model.findOne({
        shop: this.ctx.user.shop,
        shortId,
      });
      if (!existing) {
        notFound.push(shortId);
        continue;
      }

      const update: Record<string, unknown> = {};
      if (row.category !== undefined) {
        update.category = row.category;
      }
      // Price is a single embedded sub-document in Mongo, but a CSV row
      // may only carry one price column (e.g. a supplier's cost-only price
      // list) - merge onto the existing price rather than replacing the
      // whole sub-document, so untouched fields survive.
      if (row.price !== undefined) {
        update.price = {
          cost: row.price.cost ?? existing.price?.cost ?? 0,
          list: row.price.list ?? existing.price?.list ?? 0,
          sale: row.price.sale ?? existing.price?.sale ?? 0,
        };
      }
      if (row.stock !== undefined) {
        update.stock = row.stock;
      }
      if (row.imageUrls !== undefined) {
        update.imageUrls = row.imageUrls;
      }

      const updatedItem = await this.model.findOneAndUpdate(
        { _id: existing._id },
        { $set: update },
        { new: true },
      );
      updated.push(updatedItem);
    }

    return { updated, notFound, errors };
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
                list: item.list || inStockItem.price.list,
                sale: item.sale || inStockItem.price.sale,
                cost: item.cost || inStockItem.price.cost,
              },
            },
          },
        );
      }
    }
  }

  // Editing a past sale must move stock by the DIFFERENCE between the old
  // and new quantities, not re-apply the new quantities outright — the
  // original sale already took stock out once. Sale quantity going up means
  // more stock leaves, hence the negated delta (mirrors updateStock's sign).
  async reconcileStockForSaleEdit(
    oldItems: { item: unknown; quantity: number }[],
    newItems: SaleItemInput[],
  ): Promise<void> {
    const oldQty = sumQuantitiesByItemId(oldItems);
    const newQty = sumQuantitiesByItemId(newItems);
    const itemIds = new Set([...oldQty.keys(), ...newQty.keys()]);
    for (const itemId of itemIds) {
      const delta = (newQty.get(itemId) || 0) - (oldQty.get(itemId) || 0);
      if (!delta) {
        continue;
      }
      const inStockItem = await this.model.findById(itemId);
      if (!inStockItem || inStockItem.stock === -1) {
        continue;
      }
      await this.model.updateOne({ _id: itemId }, { $inc: { stock: -delta } });
    }
  }

  // Same delta approach as reconcileStockForSaleEdit, but purchases also
  // carry a price refresh — mirroring updateStockWithPurchase's side effect
  // for any item still present after the edit (added, kept, or
  // quantity-changed), while items removed during the edit only get their
  // stock contribution reversed, not their price touched.
  async reconcileStockForPurchaseEdit(
    oldItems: { item: unknown; quantity: number }[],
    newItems: PurchaseItemInput[],
  ): Promise<void> {
    const oldQty = sumQuantitiesByItemId(oldItems);
    const newQty = sumQuantitiesByItemId(newItems);
    const itemIds = new Set([...oldQty.keys(), ...newQty.keys()]);
    for (const itemId of itemIds) {
      const delta = (newQty.get(itemId) || 0) - (oldQty.get(itemId) || 0);
      const inStockItem = await this.model.findById(itemId);
      if (!inStockItem || inStockItem.stock === -1) {
        continue;
      }
      const newItem = newItems.find((i) => String(i.item) === itemId);
      const update: Record<string, unknown> = {};
      if (delta) {
        update.stock = inStockItem.stock + delta;
      }
      if (newItem) {
        update.price = {
          list: newItem.list || inStockItem.price.list,
          sale: newItem.sale || inStockItem.price.sale,
          cost: newItem.cost || inStockItem.price.cost,
        };
      }
      if (Object.keys(update).length) {
        await this.model.updateOne({ _id: itemId }, { $set: update });
      }
    }
  }
}
