import { Field, ID, InputType } from 'type-graphql';
import { Closing } from './closing.model';
import { StringField, NumberField, BooleanField } from '../../common/fields';
import { ObjectId } from 'mongodb';

@InputType()
export class SpentItemsInput {
  @Field(StringField)
  spentOn: string;

  @Field(NumberField)
  amount: number;
}

@InputType()
export class ReceivedItemsInput {
  @Field(StringField)
  receivedFor: string;

  @Field(NumberField)
  amount: number;
}

@InputType()
export class CreateClosingInput implements Partial<Closing> {
  @Field((_type) => [ID], { nullable: true })
  salesIds?: ObjectId[];

  @Field((_type) => [ID], { nullable: true })
  purchaseIds?: ObjectId[];

  @Field((_type) => [SpentItemsInput], { nullable: true })
  spentItems?: SpentItemsInput[];

  @Field((_type) => [ReceivedItemsInput], { nullable: true })
  receivedItems?: ReceivedItemsInput[];

  @Field(NumberField, { nullable: true })
  inHandTotal?: number;

  @Field(NumberField, { nullable: true })
  spentTotal?: number;

  @Field(BooleanField)
  active: boolean;

  @Field(() => Date)
  date: Date;

  @Field((_type) => ID, { nullable: true })
  shop?: ObjectId;
}

@InputType()
export class UpdateClosingInput extends CreateClosingInput {
  @Field(() => ID)
  _id: ObjectId;
}
