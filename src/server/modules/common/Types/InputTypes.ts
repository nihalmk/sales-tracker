import { InputType, Field, ObjectType } from "type-graphql";

@InputType()
export class DateRange {
  @Field(() => Date)
  from: Date;

  @Field(() => Date)
  to: Date;
}

@ObjectType()
export class LabelValueObj {
  @Field(() => String)
  label: string;

  @Field(() => String)
  value: string;
}