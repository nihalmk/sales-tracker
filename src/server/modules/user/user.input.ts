import { InputType, Field, ID } from 'type-graphql';
import { User } from './user.model';
import { ObjectId } from 'mongodb';

@InputType()
export class CreateUserInput implements Partial<User> {
  @Field((_type) => String)
  email!: string;

  @Field((_type) => String)
  password!: string;

  @Field((_type) => String)
  firstName!: string;

  @Field((_type) => String)
  lastName!: string;

  @Field((_type) => String)
  phone!: string;

  @Field((_type) => ID, { nullable: true })
  shop?: ObjectId;
}
