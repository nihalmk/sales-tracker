import { ObjectType, Field } from 'type-graphql';
import { prop, arrayProp } from '@typegoose/typegoose';
import {
  StringField,
  NumberField,
  BooleanField,
  ProfileField,
  ChannelField,
  PaymentField,
} from '../common/fields';

export interface Accepted {
  estimated_delivery_time: Date;
}

export interface PickedUp {
  timestamp: Date;
}

export class Metadata {
  type: string;
  version: number;
  source: string;
}

@ObjectType()
export class Charges {
  @prop()
  @Field(NumberField)
  joker_fee: number;

  @prop()
  @Field(NumberField)
  service_fee: number;

  @prop()
  @Field(NumberField)
  discount_fee: number;

  @prop()
  @Field(NumberField)
  payment_fee: number;
}

@ObjectType()
export class VendorInfo {
  @prop({ index: true })
  @Field(StringField)
  id: string;

  @prop()
  @Field(StringField, { nullable: true })
  name?: string;

  @prop()
  @Field(() => Charges, { nullable: true })
  charges?: Charges;
}

@ObjectType()
export class Profile {
  @prop()
  @Field(StringField)
  id: string;

  @prop()
  @Field(BooleanField)
  guest: boolean;

  @prop()
  @Field(StringField, { nullable: true })
  locale?: string;

  @prop()
  @Field(StringField)
  first_name: string;

  @prop()
  @Field(StringField)
  last_name: string;

  @prop()
  @Field(StringField, { nullable: true })
  name?: string;

  @prop()
  @Field(StringField)
  email: string;

  @prop()
  @Field(StringField)
  phone: string;
}

@ObjectType()
export class Channel {
  @prop()
  @Field(StringField)
  type: string;

  @prop()
  @Field(StringField)
  version: string;
}

@ObjectType()
export class Payment {
  @prop()
  @Field(StringField)
  payment_method: string;

  @prop()
  @Field(BooleanField)
  paid: boolean;

  @prop()
  @Field(StringField)
  transaction_number: string;

  @prop()
  @Field(NumberField)
  total_order_value: number;

  @prop()
  @Field(NumberField)
  total_tax: number;

  @prop()
  @Field(NumberField)
  coupon: number;

  @prop()
  @Field(NumberField)
  discount: number;

  @prop()
  @Field(NumberField)
  minimum_order_value_fee: number;

  @prop()
  @Field(NumberField)
  wallet_balance: number;

  @prop()
  @Field(NumberField, { nullable: true })
  loyalty_point_balance: number;

  @prop()
  @Field(NumberField)
  service_fee: number;
}

@ObjectType()
export class Customer {
  @prop()
  @Field(StringField)
  customer_id: string;

  @prop()
  @Field(ProfileField)
  profile: Profile;

  @prop()
  @Field(ChannelField)
  channel: Channel;

  @prop()
  @Field(PaymentField)
  payment: Payment;
}

@ObjectType()
export class Commission {
  @prop()
  @Field(NumberField)
  commissionable_value: number;

  @prop()
  @Field(NumberField)
  amount: number;

  @prop()
  @Field(NumberField)
  rate: number;
}

@ObjectType()
export class Tax {
  @prop()
  @Field(NumberField)
  tax_rate_percent: number;

  @prop()
  @Field(NumberField)
  net_amount: number;

  @prop()
  @Field(NumberField)
  amount: number;
}

@ObjectType()
export class Option {
  @prop()
  @Field(StringField)
  id: string;

  @prop()
  @Field(StringField)
  name: string;

  @prop()
  @Field(StringField)
  type: string;

  @prop()
  @Field(NumberField, { nullable: true })
  quantity?: number;

  @prop()
  @Field(StringField, { nullable: true })
  customer_notes?: string;
}

@ObjectType()
export class Item {
  @prop()
  @Field(StringField)
  id: string;

  @prop()
  @Field(StringField)
  name: string;

  @prop()
  @Field(StringField)
  customer_notes: string;

  @arrayProp({ items: Option })
  @Field(() => [Option])
  options: Option[];

  @prop()
  @Field(NumberField)
  quantity: number;
}

@ObjectType()
export class OrderInfo {
  @prop()
  @Field(NumberField)
  minimum_order_value: number;

  @prop()
  @Field(NumberField)
  deposit: number;

  @prop()
  @Field(NumberField)
  order_value: number;

  @prop()
  @Field(() => Tax)
  tax: Tax;

  @arrayProp({ items: Item })
  @Field(() => [Item])
  items: Item[];
}

@ObjectType()
export class Location {
  @prop()
  @Field(StringField, { nullable: true })
  id?: string;

  @prop()
  @Field(StringField, { nullable: true })
  label?: string;

  @prop()
  @Field(StringField, { nullable: true })
  address_text?: string;

  @prop()
  @Field(StringField, { nullable: true })
  street?: string;

  @prop()
  @Field(StringField, { nullable: true })
  building?: string;

  @prop()
  @Field(StringField, { nullable: true })
  district?: string;

  @prop()
  @Field(StringField, { nullable: true })
  description?: string;

  @prop()
  @Field(StringField, { nullable: true })
  postal_code?: string;

  @prop()
  @Field(StringField, { nullable: true })
  city?: string;

  @prop()
  @Field(NumberField, { nullable: true })
  latitude?: number;

  @prop()
  @Field(NumberField, { nullable: true })
  longitude?: number;
}

@ObjectType()
export class Delivery {
  @prop()
  @Field(NumberField)
  tip: number;

  @prop()
  @Field(NumberField)
  delivery_fee: number;

  @prop()
  @Field(() => Tax)
  tax: Tax;

  @prop()
  @Field(() => Location, { nullable: true })
  location?: Location;

  @prop()
  @Field(StringField, { nullable: true })
  provider?: string;
}

export class OrderStatusContent {
  global_entity_id: string;
  order_id: string;
  vendor: VendorInfo;
  country_code: string;
  timestamp: Date;
  status: string;
  accepted?: Accepted;
  picked_up?: PickedUp;
  [key: string]: any;
}

@ObjectType()
export class OrderContent {
  @prop({ index: true })
  @Field(StringField)
  order_id!: string;

  @prop()
  @Field(StringField)
  brand_name!: string;

  @prop()
  @Field(StringField)
  country_code!: string;

  @prop()
  @Field(StringField)
  locale!: string;

  @prop({ index: true })
  @Field(StringField)
  global_entity_id!: string;

  @prop()
  @Field(StringField)
  timestamp!: string;

  @prop()
  @Field(StringField, { nullable: true })
  promised_customer_timestamp?: string;

  @prop()
  @Field(StringField)
  currency!: string;

  @prop()
  @Field(StringField)
  business_type: string;

  @prop()
  @Field(() => VendorInfo)
  vendor: VendorInfo;

  @prop()
  @Field(() => Customer)
  customer: Customer;

  @prop()
  @Field(() => Commission)
  commission: Commission;

  @prop()
  @Field(() => OrderInfo)
  order: OrderInfo;

  @prop()
  @Field(() => Delivery)
  delivery: Delivery;

  @prop()
  @Field(BooleanField)
  corporate: boolean;

  @prop()
  @Field(BooleanField)
  preorder: boolean;

  @prop()
  @Field(BooleanField)
  test_order: boolean;
}

export class IOrder {
  global_entity_id: string;
  metadata: Metadata;
  content: OrderContent;
  version: number;
}

export class IOrderStatus {
  global_entity_id: string;
  metadata: Metadata;
  content: OrderStatusContent;
  version: number;
}
