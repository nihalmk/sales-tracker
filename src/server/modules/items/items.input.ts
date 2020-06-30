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

  @Field(StringField, { nullable: true})
  category?: string;

  @Field(() => PriceInput, { nullable: true })
  price: PriceInput;
  
  @Field(NumberField)
  stock: number;

  @Field((_type) => ID, { nullable: true})
  shop?: ObjectId;
}

@InputType()
export class UpdateItemsInput implements Partial<Items> {
  @Field(() => ID)
  _id: ObjectId;

  @Field(StringField)
  name!: string;

  @Field(StringField, { nullable: true})
  category?: string;

  @Field(() => PriceInput, { nullable: true })
  price: PriceInput;
  
  @Field(NumberField)
  stock: number;
}
