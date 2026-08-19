import _ from 'lodash';
import { ShopModel } from '../shop/shop.model';
import { ItemsModel } from '../items/items.model';
import { PublicShop, PaginatedPublicItems } from './store.model';

const DEFAULT_LIMIT = 20;
// A public, unauthenticated endpoint - cap page size server-side rather
// than trusting the caller's `limit`, unlike the internal getItems query
// which lets an authenticated admin request everything at once for CSV
// export.
const MAX_LIMIT = 100;

const exactCaseInsensitive = (value: string) =>
  new RegExp(`^${_.escapeRegExp(value)}$`, 'i');

// Only a shop the owner has explicitly published is ever visible here -
// an existing slug on an unpublished shop resolves to "not found" rather
// than leaking that the shop exists.
const findPublishedShop = (slug: string) =>
  ShopModel.findOne({ slug, isPublished: true });

export class StoreService {
  async getPublicShop(slug: string): Promise<PublicShop | null> {
    const shop = await findPublishedShop(slug);
    if (!shop) {
      return null;
    }
    return {
      _id: shop._id,
      name: shop.name,
      slug: shop.slug,
      tagline: shop.tagline,
      whatsappNumber: shop.whatsappNumber,
      contactEmail: shop.contactEmail,
    };
  }

  async getPublicItems(
    slug: string,
    search?: string,
    category?: string,
    page = 1,
    limit = DEFAULT_LIMIT,
  ): Promise<PaginatedPublicItems> {
    const shop = await findPublishedShop(slug);
    if (!shop) {
      return { items: [], totalCount: 0 };
    }

    // Service-charge items (stock === -1) are internal bookkeeping, never
    // real products - excluded from the storefront in every case. Regular
    // browsing (no search) also hides anything out of stock; a search
    // still surfaces out-of-stock matches so a customer can see "we carry
    // this, but it's currently sold out" (client shows an OOS badge).
    const filter: Record<string, unknown> = {
      shop: shop._id,
      stock: { $ne: -1 },
    };
    if (search) {
      filter.name = new RegExp(_.escapeRegExp(search), 'i');
    } else {
      filter.stock = { $gt: 0 };
    }
    if (category) {
      filter.category = exactCaseInsensitive(category);
    }

    const effectiveLimit = Math.min(
      limit && limit > 0 ? limit : DEFAULT_LIMIT,
      MAX_LIMIT,
    );
    const effectivePage = page && page > 0 ? page : 1;

    const [items, totalCount] = await Promise.all([
      ItemsModel.find(filter)
        .sort({ name: 1 })
        .skip((effectivePage - 1) * effectiveLimit)
        .limit(effectiveLimit),
      ItemsModel.countDocuments(filter),
    ]);

    return {
      items: items.map((item) => ({
        _id: item._id,
        shortId: item.shortId,
        name: item.name,
        category: item.category,
        price: {
          list: item.price?.list || 0,
          sale: item.price?.sale || 0,
        },
        imageUrls: item.imageUrls,
        inStock: item.stock > 0,
      })),
      totalCount,
    };
  }

  // Scoped to in-stock items only, matching the default (no-search) browse
  // filter above - a category menu shouldn't offer a category that's
  // currently empty on regular navigation.
  async getPublicCategories(slug: string): Promise<string[]> {
    const shop = await findPublishedShop(slug);
    if (!shop) {
      return [];
    }
    const categories = await ItemsModel.distinct('category', {
      shop: shop._id,
      stock: { $gt: 0 },
      category: { $nin: [null, ''] },
    });
    return categories.sort((a: string, b: string) => a.localeCompare(b));
  }
}
