import { Field, ID, InputType } from 'type-graphql';
import { Purchase } from './purchase.model';
import { StringField, NumberField } from '../../common/fields';
import { ObjectId } from 'mongodb';

@InputType()
export class PurchaseItemInput {
  @Field((_type) => ID)
  item: ObjectId;

  @Field(NumberField)
  quantity: number;

  @Field(NumberField)
  cost: number;

  @Field(NumberField)
  total: number;
}

@InputType()
export class CreatePurchaseInput implements Partial<Purchase> {
  @Field((_type) => [PurchaseItemInput])
  items: PurchaseItemInput[];

  @Field(StringField, { nullable: true})
  vendor?: string;

  @Field(StringField, { nullable: true })
  contact?: string;

  @Field(StringField, { nullable: true })
  email?: string;

  @Field(NumberField)
  total: number;

  @Field(NumberField, { nullable: true })
  discount?: number;

  @Field((_type) => ID, { nullable: true })
  shop?: ObjectId;
}

@InputType()
export class UpdatePurchaseInput extends CreatePurchaseInput {
  @Field(() => ID)
  _id: ObjectId;
}
