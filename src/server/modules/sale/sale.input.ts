import { Field, ID, InputType } from 'type-graphql';
import { Sale } from './sale.model';
import { StringField, NumberField } from '../../common/fields';
import { ObjectId } from 'mongodb';

@InputType()
export class SaleItemInput {
  @Field((_type) => ID)
  item: ObjectId;

  @Field(NumberField)
  quantity: number;

  @Field(NumberField)
  cost: number;

  @Field(NumberField)
  discount?: number;

  @Field(NumberField)
  total: number;
}

@InputType()
export class CreateSaleInput implements Partial<Sale> {
  @Field((_type) => [SaleItemInput])
  items: SaleItemInput[];

  @Field(StringField, { nullable: true})
  customer?: string;

  @Field(StringField, { nullable: true })
  contact?: string;

  @Field(StringField, { nullable: true })
  email?: string;

  @Field(NumberField)
  total: number;

  @Field(NumberField, { nullable: true })
  discount?: number;

  @Field(NumberField)
  profit: number;

  @Field(NumberField)
  loss: number;

  @Field((_type) => ID, { nullable: true })
  shop?: ObjectId;
}

@InputType()
export class UpdateSaleInput extends CreateSaleInput {
  @Field(() => ID)
  _id: ObjectId;
}

@InputType()
export class DateRange {
  @Field(() => Date)
  from: Date;

  @Field(() => Date)
  to: Date;
}
