import { InputType, Field, ID } from 'type-graphql';
import { Items } from './items.model';
import { StringField, NumberField } from '../../common/fields';
import { ObjectId } from 'mongodb';

@InputType()
export class PriceInput {
  @Field(NumberField)
  sale: number;

  @Field(NumberField)
  cost: number;

  @Field(NumberField)
  list: number;
}

@InputType()
export class CreateItemsInput implements Partial<Items> {
  @Field(StringField)
  name!: string;

  @Field(StringField, { nullable: true })
  category?: string;

  @Field(() => PriceInput, { nullable: true })
  price: PriceInput;

  @Field(NumberField)
  stock: number;

  @Field((_type) => [String], { nullable: true })
  imageUrls?: string[];

  @Field((_type) => ID, { nullable: true })
  shop?: ObjectId;
}

@InputType()
export class UpdateItemsInput implements Partial<Items> {
  @Field(() => ID)
  _id: ObjectId;

  @Field(StringField)
  name!: string;

  @Field(StringField, { nullable: true })
  category?: string;

  @Field(() => PriceInput, { nullable: true })
  price: PriceInput;

  @Field(NumberField)
  stock: number;

  @Field((_type) => [String], { nullable: true })
  imageUrls?: string[];
}

// Every field optional (unlike PriceInput) - a CSV row bulk-updating just
// one price column (e.g. a supplier's cost-only price list) must be able
// to leave the other two untouched rather than zeroing them out.
@InputType()
export class BulkUpdatePriceInput {
  @Field(NumberField, { nullable: true })
  sale?: number;

  @Field(NumberField, { nullable: true })
  cost?: number;

  @Field(NumberField, { nullable: true })
  list?: number;
}

// Deliberately has no `name` field - CSV bulk import is only ever allowed
// to touch category/price/stock/imageUrls, matched against an existing
// item by shortId. Anything else in an uploaded CSV (e.g. a Name column)
// is for the user's own reference only and is never sent to the server.
@InputType()
export class BulkUpdateItemInput {
  @Field(StringField)
  shortId!: string;

  @Field(StringField, { nullable: true })
  category?: string;

  @Field(() => BulkUpdatePriceInput, { nullable: true })
  price?: BulkUpdatePriceInput;

  @Field(NumberField, { nullable: true })
  stock?: number;

  @Field((_type) => [String], { nullable: true })
  imageUrls?: string[];
}
