import { getModelForClass, prop, Ref, pre, arrayProp } from '@typegoose/typegoose';
import { ObjectType, Field, ID } from 'type-graphql';
import { ObjectId } from 'mongodb';
import { StringField, NumberField, BooleanField, DateField } from '../../common/fields';
import { Shop } from '../shop/shop.model';
import moment from 'moment-timezone';
import { Sale } from '../sale/sale.model';

@ObjectType()
export class SpentItems {
  @prop()
  @Field(StringField)
  spentOn: string;

  @prop()
  @Field(NumberField)
  amount: number;
}

@ObjectType()
export class ReceivedItems {
  @prop()
  @Field(StringField)
  receivedFor: string;

  @prop()
  @Field(NumberField)
  amount: number;
}

function between(min: number, max: number): number {  
  return Math.floor(
    Math.random() * (max - min + 1) + min
  )
}

@pre<Closing>('save', async function () {
  this.closingId = `${moment().format('YYYYMMDD')}${between(10000, 99999).toString()}`;
})

@ObjectType({ description: 'The Closings model' })
export class Closing {
  @Field((_type) => ID)
  readonly _id!: ObjectId;

  @prop({ required: true, default: 10000 })
  @Field(StringField)
  closingId: string;

  @prop({ ref: 'Sale', index: true })
  @Field((_type) => [Sale])
  sales: Ref<Sale>[];

  @arrayProp({ items: SpentItems, index: true })
  @Field((_type) => [SpentItems])
  spentItems: SpentItems[];

  @arrayProp({ items: ReceivedItems, index: true })
  @Field((_type) => [ReceivedItems])
  receivedItems: ReceivedItems[];

  @prop()
  @Field(NumberField)
  inHandTotal: number;

  @prop()
  @Field(NumberField)
  spentTotal: number;

  @prop()
  @Field(BooleanField)
  active: boolean;

  @prop()
  @Field(() => Date)
  date: Date;

  @prop({ ref: 'Shop', required: false, index: true })
  @Field((_type) => Shop, { nullable: true })
  shop: Ref<Shop>;

  @Field(DateField)
  public createdAt: Date;

  @Field(DateField)
  public updatedAt: Date;
}

export const ClosingModel = getModelForClass(Closing, {
  schemaOptions: { timestamps: true },
});
