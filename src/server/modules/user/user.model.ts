import { Field, ID, ObjectType } from 'type-graphql';
import { getModelForClass, prop, Ref, arrayProp } from '@typegoose/typegoose';
import { ObjectId } from 'mongodb';
import { Shop } from '../shop/shop.model';
import { StringField, DateField } from '../../common/fields';

// User roles

export enum Roles {
  Sales = 'Sales',
  Manager = 'Manager',
  Admin = 'Admin',
}

@ObjectType({ description: 'The User model' })
export class User {
  @Field((_) => ID)
  public _id: ObjectId;

  @Field(StringField)
  @prop()
  firstName!: string;

  @Field(StringField)
  @prop()
  lastName!: string;

  @Field()
  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  @Field((_type) => [Roles])
  @arrayProp({ items: String, enum: Roles })
  public roles!: Roles[];

  @Field((_type) => Roles)
  @prop({ enum: Roles })
  public role!: Roles;

  @prop({ ref: 'Shop', required: false, index: true })
  @Field((_type) => Shop, { nullable: true })
  public shop?: Ref<Shop>;

  @Field(DateField)
  public createdAt: Date;

  @Field(DateField)
  public updatedAt: Date;
}

export const UserModel = getModelForClass(User, {
  schemaOptions: { timestamps: true },
});
