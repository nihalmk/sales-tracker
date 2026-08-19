import { getModelForClass, prop, Ref } from '@typegoose/typegoose';
import { ObjectType, Field, ID } from 'type-graphql';
import { ObjectId } from 'mongodb';
import { StringField, BooleanField } from '../../common/fields';

export enum ShopType {
  Mobile = 'Mobile',
}

@ObjectType()
class Branches {
  @prop({ ref: 'Shop', required: true, index: true })
  id: Ref<Shop>;

  @prop()
  @Field(StringField)
  name: string;
}

@ObjectType()
class Address {
  @prop({ index: true })
  @Field(StringField)
  street: string;

  @prop({ index: true })
  @Field(StringField)
  pincode: string;

  @prop({ index: true })
  @Field(StringField, { nullable: true })
  lat?: string;

  @prop({ index: true })
  @Field(StringField, { nullable: true })
  long?: string;
}

@ObjectType({ description: 'The Shop model' })
export class Shop {
  @Field((_type) => ID)
  readonly _id!: ObjectId;

  @prop({ required: true })
  @Field(StringField)
  name: string;

  @prop()
  @Field(() => String)
  type: string;

  @prop()
  @Field(StringField, { nullable: true })
  timezone?: string;

  @prop({ type: Address, required: false })
  @Field(() => Address, { nullable: true })
  address?: Address;

  @prop({ type: () => [Branches], required: false })
  @Field(() => [Branches], { nullable: true })
  branches?: Branches[];

  // URL-friendly identifier for the public storefront (/store/<slug>) -
  // generated once at creation time (see slug.ts) and backfilled for
  // pre-existing shops by slugBackfill.ts. Never user-editable, so
  // previously shared links never break.
  @prop({ index: true })
  @Field(StringField, { nullable: true })
  slug?: string;

  @prop()
  @Field(StringField, { nullable: true })
  whatsappNumber?: string;

  @prop()
  @Field(StringField, { nullable: true })
  contactEmail?: string;

  @prop()
  @Field(StringField, { nullable: true })
  tagline?: string;

  // Public storefront is opt-in - defaults to false so a shop is never
  // exposed at /store/<slug> before the owner deliberately publishes it.
  @prop({ default: false })
  @Field(BooleanField)
  isPublished: boolean;
}

export const ShopModel = getModelForClass(Shop, {
  schemaOptions: { timestamps: true },
});
