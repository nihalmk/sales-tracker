import { getModelForClass, prop, Ref, pre } from '@typegoose/typegoose';
import { ObjectType, Field, ID } from 'type-graphql';
import { ObjectId } from 'mongodb';
import { StringField, NumberField, DateField } from '../../common/fields';
import { Shop } from '../shop/shop.model';

@ObjectType()
export class Price {
  @prop()
  @Field(NumberField)
  sale: number;

  @prop()
  @Field(NumberField)
  cost: number;

  @prop()
  @Field(NumberField)
  list: number;
}

function between(min: number, max: number): number {  
  return Math.floor(
    Math.random() * (max - min + 1) + min
  )
}

@pre<Items>('save', async function () {
  this.shortId = between(1000, 9999).toString();
})

@ObjectType({ description: 'The Items model' })
export class Items {
  @Field((_type) => ID)
  readonly _id!: ObjectId;

  @prop({ required: true, default: 1000 })
  @Field(StringField)
  shortId: string;

  @prop({ required: true })
  @Field(StringField)
  name: string;

  @prop()
  @Field(StringField, { nullable: true})
  category?: string;

  @prop({ type: Price, required: false })
  @Field(() => Price, { nullable: true })
  price: Price;

  @prop()
  @Field(NumberField)
  stock: number;

  @prop({ ref: 'Shop', required: false, index: true })
  @Field((_type) => Shop, { nullable: true })
  shop: Ref<Shop>;

  @Field(DateField)
  public createdAt: Date;

  @Field(DateField)
  public updatedAt: Date;
}

export const ItemsModel = getModelForClass(Items, {
  schemaOptions: { timestamps: true },
});

// totalStockAmount is aggregated across every Item matching the query's
// filters (search term included), not just the current page — so it stays
// correct regardless of which page is in view.
@ObjectType({ description: 'A page of Items plus totals for the whole set' })
export class PaginatedItems {
  @Field((_type) => [Items])
  items: Items[];

  @Field(NumberField)
  totalCount: number;

  @Field(NumberField)
  totalStockAmount: number;
}
