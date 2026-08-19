import { ShopModel } from './shop.model';
import { ObjectId } from 'mongodb';

// Lowercase, non-alphanumeric runs collapsed to a single hyphen, leading/
// trailing hyphens trimmed. Falls back to "shop" so a name that's entirely
// symbols/unicode never produces an empty slug.
export const slugify = (name: string): string =>
  name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'shop';

// Appends -2, -3, ... until the slug is free. `excludeId` lets a shop keep
// its own slug when regenerating (not currently exposed to users, but
// keeps this function correct if that ever changes).
export const generateUniqueSlug = async (
  name: string,
  excludeId?: ObjectId,
): Promise<string> => {
  const base = slugify(name);
  let candidate = base;
  let suffix = 2;
  while (
    await ShopModel.exists({
      slug: candidate,
      ...(excludeId ? { _id: { $ne: excludeId } } : {}),
    })
  ) {
    candidate = `${base}-${suffix}`;
    suffix++;
  }
  return candidate;
};
