// Items-specific CSV column mapping, built on top of the generic reader/
// writer in csv.ts. Export writes every item's editable fields; import
// only ever reads Short ID + the fields the bulk-update mutation accepts
// (category/price/stock/imageUrls) - anything else in an uploaded sheet
// (e.g. a Name column, kept for the user's own reference) is ignored.

import { toCsv, parseCsv } from './csv';
import { Items, BulkUpdateItemInput } from '../generated/graphql';

const EXPORT_HEADERS = [
  'Short ID',
  'Name',
  'Category',
  'Cost',
  'MRP',
  'Sale',
  'Stock',
  'Image URLs',
];

export const buildItemsExportCsv = (items: Items[]): string =>
  toCsv([
    EXPORT_HEADERS,
    ...items.map((item) => [
      item.shortId,
      item.name,
      item.category || '',
      item.price?.cost ?? '',
      item.price?.list ?? '',
      item.price?.sale ?? '',
      item.stock,
      (item.imageUrls || []).join(';'),
    ]),
  ]);

type Column = 'shortId' | 'category' | 'cost' | 'list' | 'sale' | 'stock' | 'imageUrls';

const HEADER_ALIASES: Record<string, Column> = {
  'short id': 'shortId',
  shortid: 'shortId',
  category: 'category',
  cost: 'cost',
  'cost price': 'cost',
  mrp: 'list',
  list: 'list',
  'list price': 'list',
  sale: 'sale',
  'sale price': 'sale',
  stock: 'stock',
  'image urls': 'imageUrls',
  imageurls: 'imageUrls',
  images: 'imageUrls',
};

export interface ParsedItemsImport {
  rows: BulkUpdateItemInput[];
  error?: string;
}

// Only cells with actual content are mapped through - a column that's
// present in the header but blank on a given row must leave that field
// untouched, not overwrite it with 0/empty.
export const parseItemsImportCsv = (text: string): ParsedItemsImport => {
  const table = parseCsv(text).filter((row) => row.some((cell) => cell.trim() !== ''));
  if (table.length === 0) {
    return { rows: [], error: 'The file is empty.' };
  }

  const [headerRow, ...dataRows] = table;
  const columns = headerRow.map((cell) => HEADER_ALIASES[cell.trim().toLowerCase()]);
  if (!columns.includes('shortId')) {
    return { rows: [], error: 'The CSV must have a "Short ID" column.' };
  }

  const rows: BulkUpdateItemInput[] = [];
  dataRows.forEach((dataRow) => {
    const cells: Partial<Record<Column, string>> = {};
    columns.forEach((column, i) => {
      if (column && dataRow[i] !== undefined && dataRow[i].trim() !== '') {
        cells[column] = dataRow[i].trim();
      }
    });

    // Leave a blank Short ID as-is (rather than skipping the row) so the
    // server's existing "Missing Short ID" validation reports it in the
    // summary instead of it silently vanishing.
    const shortId = cells.shortId || '';
    const hasPrice = cells.cost !== undefined || cells.list !== undefined || cells.sale !== undefined;

    rows.push({
      shortId,
      category: cells.category,
      price: hasPrice
        ? {
            cost: cells.cost !== undefined ? Number(cells.cost) : undefined,
            list: cells.list !== undefined ? Number(cells.list) : undefined,
            sale: cells.sale !== undefined ? Number(cells.sale) : undefined,
          }
        : undefined,
      stock: cells.stock !== undefined ? Number(cells.stock) : undefined,
      imageUrls:
        cells.imageUrls !== undefined
          ? cells.imageUrls
              .split(';')
              .map((url) => url.trim())
              .filter(Boolean)
          : undefined,
    });
  });

  return { rows };
};
