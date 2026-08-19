import { ItemsModel } from './items.model';
import { logger } from '../../../common/logger';

// Falls back to this when nothing matches, rather than leaving `category`
// blank — the user prefers a visible bucket to sort through later over a
// silent gap in the filter/dropdown list.
export const OTHER_CATEGORY = 'Others';

interface CategoryRule {
  category: string;
  keywords: string[];
}

// Keyword -> category guesses for an item name, checked in order (first
// match wins, so more specific categories should stay above more general
// ones). Tuned for a mobile phone accessories shop. This is a fully
// offline, zero-cost heuristic — it has no notion of a product it hasn't
// been given a keyword for, so it will under-match on unfamiliar names
// rather than guess wrong. Extend the keyword lists below as real
// inventory turns up products this doesn't recognize yet.
const CATEGORY_RULES: CategoryRule[] = [
  {
    category: 'Screen Protection',
    keywords: [
      'tempered',
      'tempered glass',
      'screen guard',
      'screen protector',
      'screen film',
      'privacy glass',
    ],
  },
  {
    category: 'Cases & Covers',
    keywords: [
      'cover',
      'case',
      'back cover',
      'flip cover',
      'flip case',
      'pouch',
      'bumper',
      'skin',
      'sticker',
    ],
  },
  {
    category: 'Chargers & Adapters',
    keywords: [
      'charger',
      'adapter',
      'power adapter',
      'car charger',
      'wall charger',
      'fast charger',
      'charging block',
    ],
  },
  {
    category: 'Cables & Connectors',
    keywords: [
      'cable',
      'cord',
      'type-c',
      'type c',
      'micro usb',
      'lightning',
      'otg',
      'usb-c',
      'usb c',
      'connector',
      'hub',
      'data cable',
    ],
  },
  {
    category: 'Earphones & Headphones',
    keywords: [
      'earphone',
      'headphone',
      'earbud',
      'headset',
      'airpod',
      'neckband',
      'earpod',
    ],
  },
  {
    category: 'Bluetooth Speakers',
    keywords: ['speaker', 'boombox', 'soundbar'],
  },
  {
    category: 'Power Banks',
    keywords: ['power bank', 'powerbank'],
  },
  {
    category: 'Memory & Storage',
    keywords: [
      'memory card',
      'sd card',
      'micro sd',
      'pen drive',
      'flash drive',
      'usb drive',
    ],
  },
  {
    category: 'Batteries',
    // "batteries" is an irregular plural (not covered by matchesKeyword's
    // simple (e?s)? suffix), so it needs its own explicit entry.
    keywords: ['battery', 'batteries', 'cell'],
  },
  {
    category: 'Mounts, Holders & Stands',
    keywords: [
      'holder',
      'stand',
      'mount',
      'tripod',
      'selfie stick',
      'car mount',
      'ring holder',
      'popsocket',
      'pop socket',
    ],
  },
  {
    category: 'Smart Wearables',
    keywords: ['smartwatch', 'smart watch', 'fitness band', 'watch strap', 'band'],
  },
  {
    category: 'SIM Accessories',
    keywords: [
      'sim card',
      'sim adapter',
      'sim tray',
      'eject pin',
      'ejector pin',
      'sim cutter',
    ],
  },
  {
    category: 'Repair Parts & Tools',
    keywords: [
      'screwdriver',
      'opening tool',
      'repair kit',
      'display',
      'lcd',
      'touch screen',
      'digitizer',
      'flex cable',
      'motherboard',
      'spare part',
    ],
  },
];

const matchesKeyword = (name: string, keyword: string): boolean => {
  const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  // (e?s)? tolerates simple plurals ("cover"/"covers", "earphone"/
  // "earphones", "watch"/"watches") without listing every keyword twice.
  // Irregular plurals (e.g. "battery"/"batteries") still need their own
  // explicit entry in the rule's keyword list below.
  return new RegExp(`\\b${escaped}(e?s)?\\b`, 'i').test(name);
};

// Guesses a category from an item's name using the rules above, falling
// back to OTHER_CATEGORY when nothing matches.
export const guessCategory = (name: string): string => {
  const trimmed = (name || '').trim();
  if (!trimmed) {
    return OTHER_CATEGORY;
  }
  const rule = CATEGORY_RULES.find((r) =>
    r.keywords.some((keyword) => matchesKeyword(trimmed, keyword)),
  );
  return rule?.category || OTHER_CATEGORY;
};

// An item's MRP (price.list) counts as "missing" the same way
// MissingMrpWarning.tsx already treats it client-side: falsy covers
// undefined, null, AND 0, not just "field absent".
const isMissingMrp = (price: { list?: number; sale?: number }): boolean =>
  !price?.list;

// Background maintenance job — for every item across every shop:
//   - guesses a category for anything still missing one
//   - backfills MRP (price.list) from the item's own Sale Price when MRP
//     is missing or 0 and a Sale Price actually exists to copy from
// Safe to call on every server startup: a shop with nothing needing either
// fix just does one cheap query and returns. Never throws past its own
// boundary; the caller is expected to fire this without awaiting it and
// log any failure, since it must never block or fail app startup.
export const runItemStartupCleanup = async (): Promise<void> => {
  const candidates = await ItemsModel.find({
    $or: [
      { category: null },
      { category: '' },
      { category: { $exists: false } },
      { 'price.list': null },
      { 'price.list': 0 },
      { 'price.list': { $exists: false } },
    ],
  }).select('_id name category price');

  if (!candidates.length) {
    return;
  }

  let categorized = 0;
  let mrpBackfilled = 0;

  const bulkOps = candidates
    .map((item) => {
      const update: Record<string, unknown> = {};

      if (!item.category) {
        update.category = guessCategory(item.name);
        categorized += 1;
      }

      // Nothing to copy from if the Sale Price is itself missing/0 — leave
      // those for manual entry instead of writing another 0.
      if (isMissingMrp(item.price) && item.price?.sale) {
        update['price.list'] = item.price.sale;
        mrpBackfilled += 1;
      }

      if (!Object.keys(update).length) {
        return null;
      }
      return {
        updateOne: {
          filter: { _id: item._id },
          update: { $set: update },
        },
      };
    })
    .filter((op): op is NonNullable<typeof op> => op !== null);

  if (!bulkOps.length) {
    return;
  }

  await ItemsModel.bulkWrite(bulkOps);

  logger.info(
    `Startup item cleanup: categorized ${categorized} item(s), backfilled MRP for ${mrpBackfilled} item(s).`,
  );
};
