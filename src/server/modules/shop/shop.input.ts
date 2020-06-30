import { InputType, Field, ID } from 'type-graphql';
import { Shop, ShopType } from './shop.model';
import { StringField } from '../../common/fields';
import { ObjectId } from 'mongodb';

@InputType()
export class BranchesInput {
  @Field(() => ID)
  id: ObjectId;

  @Field(StringField)
  name: string;
}

@InputType()
export class AddressInput {
  @Field(StringField)
  street: string;

  @Field(StringField)
  pincode: string;

  @Field(StringField, { nullable: true })
  lat?: string;

  @Field(StringField, { nullable: true })
  long?: string;
}

@InputType()
export class CreateShopInput implements Partial<Shop> {
  @Field(StringField)
  name!: string;

  @Field(() => ShopType)
  type!: ShopType;

  @Field(() => AddressInput)
  address!: AddressInput;

  @Field(StringField, { nullable: true })
  timezone?: string;

  @Field(() => [BranchesInput], { nullable: true })
  branches?: BranchesInput[];
}
