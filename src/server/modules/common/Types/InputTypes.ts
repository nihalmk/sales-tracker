import { InputType, Field } from "type-graphql";

@InputType()
export class DateRange {
  @Field(() => Date)
  from: Date;

  @Field(() => Date)
  to: Date;
}