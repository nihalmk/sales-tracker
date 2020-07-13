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

  @Field((_type) => ID)
  salesIds: ObjectId[];

  @Field((_type) => [SpentItemsInput])
  spentItems: SpentItemsInput[];

  @Field((_type) => [ReceivedItemsInput])
  receivedItems: ReceivedItemsInput[];

  @Field(NumberField)
  inHandTotal: number;

  @Field(NumberField)
  spentTotal: number;

  @Field(BooleanField)
  active: boolean;

  @Field((_type) => ID, { nullable: true })
  shop?: ObjectId;
}

@InputType()
export class UpdateClosingInput extends CreateClosingInput {
  @Field(() => ID)
  _id: ObjectId;
}
