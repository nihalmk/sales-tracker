import { SaleModel, Sale, SaleCustomer, PaginatedSales } from './sale.model';
import { CreateSaleInput, UpdateSaleInput } from './sale.input';
import { CTX } from '../../interfaces/common';
import { UserService } from '../user/user.service';
import _ from 'lodash';
import { ItemsModel } from '../items/items.model';
import { ItemsService } from '../items/items.service';
import { ObjectId } from 'mongodb';
import { DateRange } from '../common/Types/InputTypes';

// Queries on models to to get/create/update sale data

// Sentinel used both as the synthetic getCustomers() entry representing
// sales with no customer name, and as the filter value that means "match
// sales with no customer name" — kept identical so the client can just pass
// back whatever it received.
export const NO_CUSTOMER_NAME = 'No name added';

// Case-insensitive exact match — anchored so "Ravi" doesn't also match
// "Ravikumar", and the input is escaped so regex metacharacters in a real
// name (e.g. "A.B. Traders") are matched literally, not as regex syntax.
const exactCaseInsensitive = (value: string) =>
  new RegExp(`^${_.escapeRegExp(value)}$`, 'i');

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
        model: ItemsModel,
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
        model: ItemsModel,
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
        model: ItemsModel,
      });
  }

  // limit=0 means "no pagination, return everything matching" — used by
  // embedded callers (e.g. the Closing flow) that need the complete set of
  // ids/totals for a date range, not just one page of it.
  async getSales(
    date: { from: Date; to: Date },
    customer?: string,
    page = 1,
    limit = 0,
    itemName?: string,
  ): Promise<PaginatedSales> {
    const filter: Record<string, unknown> = {
      shop: this.ctx.user.shop,
      createdAt: {
        $gte: date.from,
        $lte: date.to,
      },
    };
    if (customer === NO_CUSTOMER_NAME) {
      filter.customer = { $in: [null, ''] };
    } else if (customer) {
      filter.customer = exactCaseInsensitive(customer);
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
        {
          $group: {
            _id: null,
            totalAmount: { $sum: '$total' },
            totalProfit: { $sum: '$profit' },
            totalLoss: { $sum: '$loss' },
          },
        },
      ]),
    ]);
    const totals = aggregate[0] || {
      totalAmount: 0,
      totalProfit: 0,
      totalLoss: 0,
    };
    return {
      items,
      totalCount,
      totalAmount: totals.totalAmount,
      totalProfit: totals.totalProfit,
      totalLoss: totals.totalLoss,
    };
  }

  // Distinct customers derived from past sales for this shop, most recent
  // contact/email per customer name (in case they differ across visits).
  // includeUnnamed also appends a synthetic entry for sales that have no
  // customer name at all — meant for filter dropdowns only, not the
  // customer picker used when creating/editing a sale.
  async getCustomers(includeUnnamed = false): Promise<SaleCustomer[]> {
    const results = await this.model.aggregate([
      { $match: { shop: this.ctx.user.shop } },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: {
            customer: '$customer',
            contact: '$contact',
            email: '$email',
          },
          customer: { $first: '$customer' },
          contact: { $first: '$contact' },
          email: { $first: '$email' },
        },
      },
      { $project: { _id: 0, customer: 1, contact: 1, email: 1 } },
    ]);
    const named = results
      .filter((r) => r.customer)
      .sort((a, b) => a.customer.localeCompare(b.customer));
    if (includeUnnamed && results.some((r) => !r.customer)) {
      named.unshift({ customer: NO_CUSTOMER_NAME, contact: null, email: null });
    }
    return named;
  }

  async getSalesByIds(ids: ObjectId[]): Promise<Sale[]> {
    return this.model.find({
      _id: {
        $in: ids,
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

  async getLastSale(): Promise<Sale> {
    const sale = await this.model
      .find({
        shop: this.ctx.user.shop,
        closing: {
          $exists: false,
        },
      })
      .sort({ createdAt: -1 })
      .limit(1);
    return sale[0];
  }

  async getSaleWithoutClosing(): Promise<Sale[]> {
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
