import { getModelForClass, prop, Ref, pre } from '@typegoose/typegoose';
import { ObjectType, Field, ID } from 'type-graphql';
import { ObjectId } from 'mongodb';
import {
  StringField,
  NumberField,
  BooleanField,
  DateField,
} from '../../common/fields';
import { Shop } from '../shop/shop.model';
import { Items } from '../items/items.model';
import moment from 'moment-timezone';
import { Closing } from '../closing/closing.model';

@ObjectType()
export class PurchaseItem {
  @prop({ ref: 'Items', index: true })
  @Field((_type) => Items)
  item: Ref<Items>;

  @prop()
  @Field(NumberField)
  quantity: number;

  @prop()
  @Field(NumberField)
  cost: number;

  @prop()
  @Field(NumberField, { nullable: true })
  sale?: number;

  @prop()
  @Field(NumberField)
  total: number;
}

function between(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

@pre<Purchase>('save', async function () {
  this.billNumber = `P${moment().format('YYYYMMDD')}${between(
    10000,
    99999,
  ).toString()}`;
})
@ObjectType({ description: 'The Purchase model' })
export class Purchase {
  @Field((_type) => ID)
  readonly _id!: ObjectId;

  @prop({ required: true, default: 10000 })
  @Field(StringField)
  billNumber: string;

  @prop({ type: () => [PurchaseItem], index: true })
  @Field((_type) => [PurchaseItem])
  items: PurchaseItem[];

  @prop()
  @Field(StringField, { nullable: true })
  vendor?: string;

  @prop()
  @Field(StringField, { nullable: true })
  contact?: string;

  @prop()
  @Field(StringField, { nullable: true })
  email?: string;

  @prop()
  @Field(NumberField)
  total: number;

  @prop()
  @Field(NumberField, { nullable: true })
  discount?: number;

  @prop()
  @Field(BooleanField)
  active: boolean;

  @prop({ ref: 'Shop', required: false, index: true })
  @Field((_type) => Shop, { nullable: true })
  shop: Ref<Shop>;

  @prop({ ref: 'Closing', index: true })
  @Field((_type) => Closing, { nullable: true })
  closing?: Ref<Closing>;

  @Field(DateField)
  public createdAt: Date;

  @Field(DateField)
  public updatedAt: Date;
}

export const PurchaseModel = getModelForClass(Purchase, {
  schemaOptions: { timestamps: true },
});

// Not a persisted collection — derived from distinct vendor/contact/email
// combinations already recorded on past Purchases, for autofill on new ones.
@ObjectType({ description: 'A vendor derived from past purchases history' })
export class PurchaseVendor {
  @Field(StringField)
  vendor: string;

  @Field(StringField, { nullable: true })
  contact?: string;

  @Field(StringField, { nullable: true })
  email?: string;
}

// totalAmount is aggregated across every Purchase matching the query's
// filters, not just the current page — so it stays correct for the whole
// selected range regardless of which page is in view.
@ObjectType({
  description: 'A page of Purchases plus totals for the whole range',
})
export class PaginatedPurchases {
  @Field((_type) => [Purchase])
  items: Purchase[];

  @Field(NumberField)
  totalCount: number;

  @Field(NumberField)
  totalAmount: number;
}
