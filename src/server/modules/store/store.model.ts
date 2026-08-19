import { ObjectType, Field, ID } from 'type-graphql';
import { ObjectId } from 'mongodb';
import { StringField, NumberField, BooleanField } from '../../common/fields';

// Everything below is returned by unauthenticated public queries - keep it
// limited to what a customer browsing the storefront should see. Cost
// price and exact stock counts are deliberately never exposed here (see
// PublicItem.inStock, a boolean derived server-side from the real count).

@ObjectType({ description: 'Pricing shown on the public storefront' })
export class PublicPrice {
  @Field(NumberField)
  list: number;

  @Field(NumberField)
  sale: number;
}

@ObjectType({ description: 'An item as shown on the public storefront' })
export class PublicItem {
  @Field((_type) => ID)
  _id: ObjectId;

  @Field(StringField)
  shortId: string;

  @Field(StringField)
  name: string;

  @Field(StringField, { nullable: true })
  category?: string;

  @Field(() => PublicPrice)
  price: PublicPrice;

  @Field((_type) => [String], { nullable: true })
  imageUrls?: string[];

  @Field(BooleanField)
  inStock: boolean;
}

@ObjectType({ description: 'A page of public items' })
export class PaginatedPublicItems {
  @Field((_type) => [PublicItem])
  items: PublicItem[];

  @Field(NumberField)
  totalCount: number;
}

@ObjectType({ description: 'Shop info shown on the public storefront' })
export class PublicShop {
  @Field((_type) => ID)
  _id: ObjectId;

  @Field(StringField)
  name: string;

  @Field(StringField)
  slug: string;

  @Field(StringField, { nullable: true })
  tagline?: string;

  @Field(StringField, { nullable: true })
  whatsappNumber?: string;

  @Field(StringField, { nullable: true })
  contactEmail?: string;
}
