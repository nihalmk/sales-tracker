import _ from 'lodash';
import {
  Sale,
  Purchase,
  SpentItemsInput,
  ReceivedItemsInput,
} from '../../generated/graphql';

export interface GroupedRow {
  name: string;
  quantity?: number;
  total: number;
}

// Which number drives sorting and bar sizing in the report charts — total
// money, or units moved (only meaningful for sales/purchases, which have a
// quantity; spent/received only ever use 'total').
export type ChartMetric = 'total' | 'quantity';

// One row per item name, summed across every sale/purchase in the period —
// used for the multi-day report view instead of one row per line item.
export const groupSalesByItem = (sales: Sale[]): GroupedRow[] => {
  const lineItems = _.flatMap(sales, (sale) => sale.items || []);
  const grouped = _.groupBy(lineItems, (i) => i.item?.name || 'Unknown');
  return Object.entries(grouped).map(([name, items]) => ({
    name,
    quantity: _.sum(items.map((i) => i.quantity)),
    total: _.sum(items.map((i) => i.total)),
  }));
};

export const groupPurchasesByItem = (purchases: Purchase[]): GroupedRow[] => {
  const lineItems = _.flatMap(purchases, (purchase) => purchase.items || []);
  const grouped = _.groupBy(lineItems, (i) => i.item?.name || 'Unknown');
  return Object.entries(grouped).map(([name, items]) => ({
    name,
    quantity: _.sum(items.map((i) => i.quantity)),
    total: _.sum(items.map((i) => i.total)),
  }));
};

export const groupSpentByName = (items: SpentItemsInput[]): GroupedRow[] => {
  const grouped = _.groupBy(items, (i) => i.spentOn || 'Unknown');
  return Object.entries(grouped).map(([name, group]) => ({
    name,
    total: _.sum(group.map((g) => g.amount)),
  }));
};

export const groupReceivedByName = (
  items: ReceivedItemsInput[],
): GroupedRow[] => {
  const grouped = _.groupBy(items, (i) => i.receivedFor || 'Unknown');
  return Object.entries(grouped).map(([name, group]) => ({
    name,
    total: _.sum(group.map((g) => g.amount)),
  }));
};
