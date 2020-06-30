import { getModelForClass, prop, arrayProp, Ref } from '@typegoose/typegoose';
import { ObjectType, Field, ID } from 'type-graphql';
import { ObjectId } from 'mongodb';
import { StringField } from '../../common/fields';

export enum ShopType {
  Mobile = 'Mobile',
}

@ObjectType()
class Branches {
  @prop({ ref: 'Shop', required: true, index: true })
  id: Ref<Shop>;

  @prop()
  @Field(StringField)
  name: string;
}

@ObjectType()
class Address {
  @prop({ index: true })
  @Field(StringField)
  street: string;

  @prop({ index: true })
  @Field(StringField)
  pincode: string;

  @prop({ index: true })
  @Field(StringField, { nullable: true })
  lat?: string;

  @prop({ index: true })
  @Field(StringField, { nullable: true })
  long?: string;
}

@ObjectType({ description: 'The Shop model' })
export class Shop {
  @Field((_type) => ID)
  readonly _id!: ObjectId;

  @prop({ required: true })
  @Field(StringField)
  name: string;

  @prop({ enum: ShopType })
  @Field(() => ShopType)
  type: string;

  @prop()
  @Field(StringField, { nullable: true })
  timezone?: string;

  @prop({ type: Address, required: false })
  @Field(() => Address, { nullable: true })
  address?: Address;

  @arrayProp({ items: Branches, required: false })
  @Field(() => [Branches], { nullable: true })
  branches?: Branches[];
}

export const ShopModel = getModelForClass(Shop, {
  schemaOptions: { timestamps: true },
});
