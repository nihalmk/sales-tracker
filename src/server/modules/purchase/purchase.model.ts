import { getModelForClass, prop, Ref, pre, arrayProp } from '@typegoose/typegoose';
import { ObjectType, Field, ID } from 'type-graphql';
import { ObjectId } from 'mongodb';
import { StringField, NumberField, BooleanField, DateField } from '../../common/fields';
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
  @Field(NumberField)
  total: number;
}

function between(min: number, max: number): number {  
  return Math.floor(
    Math.random() * (max - min + 1) + min
  )
}

@pre<Purchase>('save', async function () {
  this.billNumber = `P${moment().format('YYYYMMDD')}${between(10000, 99999).toString()}`;
})
@ObjectType({ description: 'The Purchase model' })
export class Purchase {
  @Field((_type) => ID)
  readonly _id!: ObjectId;

  @prop({ required: true, default: 10000 })
  @Field(StringField)
  billNumber: string;

  @arrayProp({ items: PurchaseItem, index: true })
  @Field((_type) => [PurchaseItem])
  items: PurchaseItem[];

  @prop()
  @Field(StringField, { nullable: true})
  vendor?: string;

  @prop()
  @Field(StringField, { nullable: true})
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
