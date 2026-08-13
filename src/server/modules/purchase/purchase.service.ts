import {
  PurchaseModel,
  Purchase,
  PurchaseVendor,
  PaginatedPurchases,
} from './purchase.model';
import { CreatePurchaseInput, UpdatePurchaseInput } from './purchase.input';
import { CTX } from '../../interfaces/common';
import { UserService } from '../user/user.service';
import _ from 'lodash';
import { ItemsModel } from '../items/items.model';
import { ItemsService } from '../items/items.service';
import { ObjectId } from 'mongodb';
import { DateRange } from '../common/Types/InputTypes';

// Queries on models to to get/create/update purchase data

// Sentinel used both as the synthetic getVendors() entry representing
// purchases with no vendor name, and as the filter value that means "match
// purchases with no vendor name" — kept identical so the client can just
// pass back whatever it received.
export const NO_VENDOR_NAME = 'No name added';

// Case-insensitive exact match — anchored so "Ravi" doesn't also match
// "Ravikumar", and the input is escaped so regex metacharacters in a real
// name (e.g. "A.B. Traders") are matched literally, not as regex syntax.
const exactCaseInsensitive = (value: string) =>
  new RegExp(`^${_.escapeRegExp(value)}$`, 'i');

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
        model: ItemsModel,
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
        model: ItemsModel,
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
        model: ItemsModel,
      });
  }

  // limit=0 means "no pagination, return everything matching" — used by
  // embedded callers (e.g. the Closing flow) that need the complete set of
  // ids/totals for a date range, not just one page of it.
  async getPurchases(
    date: { from: Date; to: Date },
    vendor?: string,
    page = 1,
    limit = 0,
    itemName?: string,
  ): Promise<PaginatedPurchases> {
    const filter: Record<string, unknown> = {
      shop: this.ctx.user.shop,
      createdAt: {
        $gte: date.from,
        $lte: date.to,
      },
    };
    if (vendor === NO_VENDOR_NAME) {
      filter.vendor = { $in: [null, ''] };
    } else if (vendor) {
      filter.vendor = exactCaseInsensitive(vendor);
    }
    if (itemName) {
      // A product name can map to several Items docs over time (a new one
      // is created whenever purchase cost changes), so match every item
      // sharing this name, not just one specific document.
      const matchingItemIds = await ItemsModel.find({
        shop: this.ctx.user.shop,
        name: exactCaseInsensitive(itemName),
      }).distinct('_id');
      filter['items.item'] = { $in: matchingItemIds };
    }

    let query = this.model
      .find(filter)
      .sort({ createdAt: -1 })
      .populate('shop')
      .populate({
        path: 'items.item',
        model: ItemsModel,
      });
    if (limit > 0) {
      query = query.skip((page - 1) * limit).limit(limit);
    }

    const [items, totalCount, aggregate] = await Promise.all([
      query,
      this.model.countDocuments(filter),
      this.model.aggregate([
        { $match: filter },
        { $group: { _id: null, totalAmount: { $sum: '$total' } } },
      ]),
    ]);
    const totals = aggregate[0] || { totalAmount: 0 };
    return {
      items,
      totalCount,
      totalAmount: totals.totalAmount,
    };
  }

  // Distinct vendors derived from past purchases for this shop, unique per
  // vendor+contact+email combination. includeUnnamed also appends a
  // synthetic entry for purchases that have no vendor name at all — meant
  // for filter dropdowns only, not the vendor picker used when
  // creating/editing a purchase.
  async getVendors(includeUnnamed = false): Promise<PurchaseVendor[]> {
    const results = await this.model.aggregate([
      { $match: { shop: this.ctx.user.shop } },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: {
            vendor: '$vendor',
            contact: '$contact',
            email: '$email',
          },
          vendor: { $first: '$vendor' },
          contact: { $first: '$contact' },
          email: { $first: '$email' },
        },
      },
      { $project: { _id: 0, vendor: 1, contact: 1, email: 1 } },
    ]);
    const named = results
      .filter((r) => r.vendor)
      .sort((a, b) => a.vendor.localeCompare(b.vendor));
    if (includeUnnamed && results.some((r) => !r.vendor)) {
      named.unshift({ vendor: NO_VENDOR_NAME, contact: null, email: null });
    }
    return named;
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
        closing: {
          $exists: false,
        },
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
