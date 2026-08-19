import { ShopModel } from './shop.model';
import { generateUniqueSlug } from './slug';
import { logger } from '../../../common/logger';

// One-time backfill for shops created before the public storefront feature
// existed. Run fire-and-forget at startup (see index.ts) - never awaited,
// never blocks boot. Processes shops one at a time (not a bulk op) because
// each new slug must avoid every slug already assigned in this same pass,
// including ones just written a moment ago.
export const runShopSlugBackfill = async (): Promise<void> => {
  const shops = await ShopModel.find({
    $or: [{ slug: { $exists: false } }, { slug: null }, { slug: '' }],
  }).select('_id name');

  if (!shops.length) {
    return;
  }

  for (const shop of shops) {
    const slug = await generateUniqueSlug(shop.name);
    await ShopModel.updateOne({ _id: shop._id }, { $set: { slug } });
  }

  logger.info(
    `Startup shop cleanup: assigned a slug to ${shops.length} shop(s).`,
  );
};
