import { InputType, Field, ID } from 'type-graphql';
import { Shop } from './shop.model';
import { StringField, BooleanField } from '../../common/fields';
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

  @Field(() => String)
  type!: string;

  @Field(() => AddressInput)
  address!: AddressInput;

  @Field(StringField, { nullable: true })
  timezone?: string;

  @Field(() => [BranchesInput], { nullable: true })
  branches?: BranchesInput[];
}

// Deliberately excludes `slug` - it's assigned once at creation and never
// user-editable, so a previously shared /store/<slug> link never breaks.
@InputType()
export class UpdateShopSettingsInput {
  @Field(StringField, { nullable: true })
  whatsappNumber?: string;

  @Field(StringField, { nullable: true })
  contactEmail?: string;

  @Field(StringField, { nullable: true })
  tagline?: string;

  @Field(BooleanField, { nullable: true })
  isPublished?: boolean;
}
