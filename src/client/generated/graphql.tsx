export type Maybe<T> = T | null;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  /** The javascript `Date` as string. Type represents date and time as the ISO Date string. */
  DateTime: any;
};

export type Address = {
   __typename?: 'Address';
  street: Scalars['String'];
  pincode: Scalars['String'];
  lat?: Maybe<Scalars['String']>;
  long?: Maybe<Scalars['String']>;
};

export type AddressInput = {
  street: Scalars['String'];
  pincode: Scalars['String'];
  lat?: Maybe<Scalars['String']>;
  long?: Maybe<Scalars['String']>;
};

export type AuthenticateParamsInput = {
  access_token?: Maybe<Scalars['String']>;
  access_token_secret?: Maybe<Scalars['String']>;
  provider?: Maybe<Scalars['String']>;
  password?: Maybe<Scalars['String']>;
  user?: Maybe<UserInput>;
  code?: Maybe<Scalars['String']>;
};

export type Branches = {
   __typename?: 'Branches';
  name: Scalars['String'];
};

export type BranchesInput = {
  id: Scalars['ID'];
  name: Scalars['String'];
};

export type Channel = {
   __typename?: 'Channel';
  type: Scalars['String'];
  version: Scalars['String'];
};

export type Charges = {
   __typename?: 'Charges';
  joker_fee: Scalars['Float'];
  service_fee: Scalars['Float'];
  discount_fee: Scalars['Float'];
  payment_fee: Scalars['Float'];
};

/** The Closings model */
export type Closing = {
   __typename?: 'Closing';
  _id: Scalars['ID'];
  closingId: Scalars['String'];
  sales: Array<Sale>;
  spentItems: Array<SpentItems>;
  receivedItems: Array<ReceivedItems>;
  inHandTotal: Scalars['Float'];
  spentTotal: Scalars['Float'];
  active: Scalars['Boolean'];
  shop?: Maybe<Shop>;
  createdAt: Scalars['DateTime'];
  updatedAt: Scalars['DateTime'];
};

export type Commission = {
   __typename?: 'Commission';
  commissionable_value: Scalars['Float'];
  amount: Scalars['Float'];
  rate: Scalars['Float'];
};

export type CreateClosingInput = {
  salesIds: Array<Scalars['ID']>;
  spentItems: Array<SpentItemsInput>;
  receivedItems: Array<ReceivedItemsInput>;
  inHandTotal: Scalars['Float'];
  spentTotal: Scalars['Float'];
  active: Scalars['Boolean'];
  shop?: Maybe<Scalars['ID']>;
};

export type CreateItemsInput = {
  name: Scalars['String'];
  category?: Maybe<Scalars['String']>;
  price?: Maybe<PriceInput>;
  stock: Scalars['Float'];
  shop?: Maybe<Scalars['ID']>;
};

export type CreatePurchaseInput = {
  items: Array<PurchaseItemInput>;
  vendor?: Maybe<Scalars['String']>;
  contact?: Maybe<Scalars['String']>;
  email?: Maybe<Scalars['String']>;
  total: Scalars['Float'];
  discount?: Maybe<Scalars['Float']>;
  shop?: Maybe<Scalars['ID']>;
};

export type CreateSaleInput = {
  items: Array<SaleItemInput>;
  customer?: Maybe<Scalars['String']>;
  contact?: Maybe<Scalars['String']>;
  email?: Maybe<Scalars['String']>;
  total: Scalars['Float'];
  discount?: Maybe<Scalars['Float']>;
  profit: Scalars['Float'];
  loss: Scalars['Float'];
  shop?: Maybe<Scalars['ID']>;
};

export type CreateShopInput = {
  name: Scalars['String'];
  type: ShopType;
  address: AddressInput;
  timezone?: Maybe<Scalars['String']>;
  branches?: Maybe<Array<BranchesInput>>;
};

export type CreateUserInput = {
  username?: Maybe<Scalars['String']>;
  email: Scalars['String'];
  password: Scalars['String'];
  firstName: Scalars['String'];
  lastName: Scalars['String'];
  roles: Array<Roles>;
  shop?: Maybe<Scalars['ID']>;
};

export type CreateUserResult = {
   __typename?: 'CreateUserResult';
  userId?: Maybe<Scalars['ID']>;
  loginResult?: Maybe<LoginResult>;
};

export type Customer = {
   __typename?: 'Customer';
  customer_id: Scalars['String'];
  profile: Profile;
  channel: Channel;
  payment: Payment;
};

export type DateRange = {
  from: Scalars['DateTime'];
  to: Scalars['DateTime'];
};


export type Delivery = {
   __typename?: 'Delivery';
  tip: Scalars['Float'];
  delivery_fee: Scalars['Float'];
  tax: Tax;
  location?: Maybe<Location>;
  provider: Scalars['String'];
};

export type EmailRecord = {
   __typename?: 'EmailRecord';
  address?: Maybe<Scalars['String']>;
  verified?: Maybe<Scalars['Boolean']>;
};

export type ImpersonateReturn = {
   __typename?: 'ImpersonateReturn';
  authorized?: Maybe<Scalars['Boolean']>;
  tokens?: Maybe<Tokens>;
  user?: Maybe<User>;
};

export type Item = {
   __typename?: 'Item';
  id: Scalars['String'];
  name: Scalars['String'];
  customer_notes: Scalars['String'];
  options: Array<Option>;
  quantity: Scalars['Float'];
};

/** The Items model */
export type Items = {
   __typename?: 'Items';
  _id: Scalars['ID'];
  shortId: Scalars['String'];
  name: Scalars['String'];
  category?: Maybe<Scalars['String']>;
  price?: Maybe<Price>;
  stock: Scalars['Float'];
  shop?: Maybe<Shop>;
  createdAt: Scalars['DateTime'];
  updatedAt: Scalars['DateTime'];
};

export type Location = {
   __typename?: 'Location';
  id: Scalars['String'];
  label: Scalars['String'];
  address_text: Scalars['String'];
  street: Scalars['String'];
  building: Scalars['String'];
  district: Scalars['String'];
  description: Scalars['String'];
  postal_code: Scalars['String'];
  city: Scalars['String'];
  latitude: Scalars['Float'];
  longitude: Scalars['Float'];
};

export type LoginResult = {
   __typename?: 'LoginResult';
  sessionId?: Maybe<Scalars['String']>;
  tokens?: Maybe<Tokens>;
  user?: Maybe<User>;
};

export type Mutation = {
   __typename?: 'Mutation';
  createUser?: Maybe<CreateUserResult>;
  verifyEmail?: Maybe<Scalars['Boolean']>;
  resetPassword?: Maybe<LoginResult>;
  sendVerificationEmail?: Maybe<Scalars['Boolean']>;
  sendResetPasswordEmail: Scalars['Boolean'];
  addEmail?: Maybe<Scalars['Boolean']>;
  changePassword?: Maybe<Scalars['Boolean']>;
  twoFactorSet?: Maybe<Scalars['Boolean']>;
  twoFactorUnset?: Maybe<Scalars['Boolean']>;
  impersonate?: Maybe<ImpersonateReturn>;
  refreshTokens?: Maybe<LoginResult>;
  logout?: Maybe<Scalars['Boolean']>;
  authenticate?: Maybe<LoginResult>;
  verifyAuthentication?: Maybe<Scalars['Boolean']>;
  createClosing?: Maybe<Closing>;
  updateClosing?: Maybe<Closing>;
  createItem?: Maybe<Items>;
  updateItem?: Maybe<Items>;
  createPurchase?: Maybe<Purchase>;
  updatePurchase?: Maybe<Purchase>;
  createSale?: Maybe<Sale>;
  updateSale?: Maybe<Sale>;
  createShop?: Maybe<Shop>;
  createNewUser: Scalars['ID'];
};


export type MutationCreateUserArgs = {
  user: CreateUserInput;
};


export type MutationVerifyEmailArgs = {
  token: Scalars['String'];
};


export type MutationResetPasswordArgs = {
  token: Scalars['String'];
  newPassword: Scalars['String'];
};


export type MutationSendVerificationEmailArgs = {
  email: Scalars['String'];
};


export type MutationSendResetPasswordEmailArgs = {
  email: Scalars['String'];
};


export type MutationAddEmailArgs = {
  newEmail: Scalars['String'];
};


export type MutationChangePasswordArgs = {
  oldPassword: Scalars['String'];
  newPassword: Scalars['String'];
};


export type MutationTwoFactorSetArgs = {
  secret: TwoFactorSecretKeyInput;
  code: Scalars['String'];
};


export type MutationTwoFactorUnsetArgs = {
  code: Scalars['String'];
};


export type MutationImpersonateArgs = {
  accessToken: Scalars['String'];
  username: Scalars['String'];
};


export type MutationRefreshTokensArgs = {
  accessToken: Scalars['String'];
  refreshToken: Scalars['String'];
};


export type MutationAuthenticateArgs = {
  serviceName: Scalars['String'];
  params: AuthenticateParamsInput;
};


export type MutationVerifyAuthenticationArgs = {
  serviceName: Scalars['String'];
  params: AuthenticateParamsInput;
};


export type MutationCreateClosingArgs = {
  closing: CreateClosingInput;
};


export type MutationUpdateClosingArgs = {
  closing: UpdateClosingInput;
};


export type MutationCreateItemArgs = {
  item: CreateItemsInput;
};


export type MutationUpdateItemArgs = {
  item: UpdateItemsInput;
};


export type MutationCreatePurchaseArgs = {
  purchase: CreatePurchaseInput;
};


export type MutationUpdatePurchaseArgs = {
  purchase: UpdatePurchaseInput;
};


export type MutationCreateSaleArgs = {
  sale: CreateSaleInput;
};


export type MutationUpdateSaleArgs = {
  sale: UpdateSaleInput;
};


export type MutationCreateShopArgs = {
  shop: CreateShopInput;
};


export type MutationCreateNewUserArgs = {
  user: CreateUserInput;
};

export type Option = {
   __typename?: 'Option';
  id: Scalars['String'];
  name: Scalars['String'];
  type: Scalars['String'];
  quantity: Scalars['Float'];
  customer_notes: Scalars['String'];
};

export type OrderContent = {
   __typename?: 'OrderContent';
  order_id: Scalars['String'];
  brand_name: Scalars['String'];
  country_code: Scalars['String'];
  locale: Scalars['String'];
  global_entity_id: Scalars['String'];
  timestamp: Scalars['String'];
  promised_customer_timestamp: Scalars['String'];
  currency: Scalars['String'];
  business_type: Scalars['String'];
  vendor: VendorInfo;
  customer: Customer;
  commission: Commission;
  order: OrderInfo;
  delivery: Delivery;
  corporate: Scalars['Boolean'];
  preorder: Scalars['Boolean'];
  test_order: Scalars['Boolean'];
};

export type OrderInfo = {
   __typename?: 'OrderInfo';
  minimum_order_value: Scalars['Float'];
  deposit: Scalars['Float'];
  order_value: Scalars['Float'];
  tax: Tax;
  items: Array<Item>;
};

export type Payment = {
   __typename?: 'Payment';
  payment_method: Scalars['String'];
  paid: Scalars['Boolean'];
  transaction_number: Scalars['String'];
  total_order_value: Scalars['Float'];
  total_tax: Scalars['Float'];
  coupon: Scalars['Float'];
  discount: Scalars['Float'];
  minimum_order_value_fee: Scalars['Float'];
  wallet_balance: Scalars['Float'];
  loyalty_point_balance: Scalars['Float'];
  service_fee: Scalars['Float'];
};

export type Price = {
   __typename?: 'Price';
  sale: Scalars['Float'];
  cost: Scalars['Float'];
  list: Scalars['Float'];
};

export type PriceInput = {
  sale: Scalars['Float'];
  cost: Scalars['Float'];
  list: Scalars['Float'];
};

export type Profile = {
   __typename?: 'Profile';
  id: Scalars['String'];
  guest: Scalars['Boolean'];
  locale: Scalars['String'];
  first_name: Scalars['String'];
  last_name: Scalars['String'];
  name: Scalars['String'];
  email: Scalars['String'];
  phone: Scalars['String'];
};

/** The Purchase model */
export type Purchase = {
   __typename?: 'Purchase';
  _id: Scalars['ID'];
  billNumber: Scalars['String'];
  items: Array<PurchaseItem>;
  vendor?: Maybe<Scalars['String']>;
  contact?: Maybe<Scalars['String']>;
  email?: Maybe<Scalars['String']>;
  total: Scalars['Float'];
  discount?: Maybe<Scalars['Float']>;
  active: Scalars['Boolean'];
  shop?: Maybe<Shop>;
  createdAt: Scalars['DateTime'];
  updatedAt: Scalars['DateTime'];
};

export type PurchaseItem = {
   __typename?: 'PurchaseItem';
  item: Items;
  quantity: Scalars['Float'];
  cost: Scalars['Float'];
  total: Scalars['Float'];
};

export type PurchaseItemInput = {
  item: Scalars['ID'];
  quantity: Scalars['Float'];
  cost: Scalars['Float'];
  total: Scalars['Float'];
};

export type Query = {
   __typename?: 'Query';
  twoFactorSecret?: Maybe<TwoFactorSecretKey>;
  getUser?: Maybe<User>;
  getClosingForUser: Array<Closing>;
  getClosingByClosingId: Array<Closing>;
  getItemsForUser: Array<Items>;
  getPurchasesForUser: Array<Purchase>;
  getPurchaseByBillNumber: Array<Purchase>;
  getPurchaseByVendorName: Array<Purchase>;
  getPurchaseByVendorPhone: Array<Purchase>;
  getSalesForUser: Array<Sale>;
  getSaleByBillNumber: Array<Sale>;
  getSaleByCustomerName: Array<Sale>;
  getSaleByCustomerPhone: Array<Sale>;
  getShopForUser?: Maybe<Shop>;
  me?: Maybe<User>;
  getUserById?: Maybe<User>;
};


export type QueryGetClosingForUserArgs = {
  date: DateRange;
};


export type QueryGetClosingByClosingIdArgs = {
  closingId: Scalars['String'];
};


export type QueryGetPurchasesForUserArgs = {
  date: DateRange;
};


export type QueryGetPurchaseByBillNumberArgs = {
  billNumber: Scalars['String'];
};


export type QueryGetPurchaseByVendorNameArgs = {
  vendor: Scalars['String'];
};


export type QueryGetPurchaseByVendorPhoneArgs = {
  contact: Scalars['String'];
};


export type QueryGetSalesForUserArgs = {
  date: DateRange;
};


export type QueryGetSaleByBillNumberArgs = {
  billNumber: Scalars['String'];
};


export type QueryGetSaleByCustomerNameArgs = {
  customer: Scalars['String'];
};


export type QueryGetSaleByCustomerPhoneArgs = {
  contact: Scalars['String'];
};


export type QueryGetUserByIdArgs = {
  id: Scalars['ID'];
};

export type ReceivedItems = {
   __typename?: 'ReceivedItems';
  receivedFor: Scalars['String'];
  amount: Scalars['Float'];
};

export type ReceivedItemsInput = {
  receivedFor: Scalars['String'];
  amount: Scalars['Float'];
};

export enum Roles {
  Sales = 'Sales',
  Manager = 'Manager',
  Admin = 'Admin'
}

/** The Sales model */
export type Sale = {
   __typename?: 'Sale';
  _id: Scalars['ID'];
  billNumber: Scalars['String'];
  items: Array<SaleItem>;
  customer?: Maybe<Scalars['String']>;
  contact?: Maybe<Scalars['String']>;
  email?: Maybe<Scalars['String']>;
  total: Scalars['Float'];
  discount?: Maybe<Scalars['Float']>;
  profit: Scalars['Float'];
  loss: Scalars['Float'];
  active: Scalars['Boolean'];
  shop?: Maybe<Shop>;
  createdAt: Scalars['DateTime'];
  updatedAt: Scalars['DateTime'];
};

export type SaleItem = {
   __typename?: 'SaleItem';
  item: Items;
  quantity: Scalars['Float'];
  cost: Scalars['Float'];
  discount: Scalars['Float'];
  total: Scalars['Float'];
};

export type SaleItemInput = {
  item: Scalars['ID'];
  quantity: Scalars['Float'];
  cost: Scalars['Float'];
  discount: Scalars['Float'];
  total: Scalars['Float'];
};

/** The Shop model */
export type Shop = {
   __typename?: 'Shop';
  _id: Scalars['ID'];
  name: Scalars['String'];
  type: ShopType;
  timezone?: Maybe<Scalars['String']>;
  address?: Maybe<Address>;
  branches?: Maybe<Array<Branches>>;
};

export enum ShopType {
  Mobile = 'Mobile'
}

export type SpentItems = {
   __typename?: 'SpentItems';
  spentOn: Scalars['String'];
  amount: Scalars['Float'];
};

export type SpentItemsInput = {
  spentOn: Scalars['String'];
  amount: Scalars['Float'];
};

export type Tax = {
   __typename?: 'Tax';
  tax_rate_percent: Scalars['Float'];
  net_amount: Scalars['Float'];
  amount: Scalars['Float'];
};

export type Tokens = {
   __typename?: 'Tokens';
  refreshToken?: Maybe<Scalars['String']>;
  accessToken?: Maybe<Scalars['String']>;
};

export type TwoFactorSecretKey = {
   __typename?: 'TwoFactorSecretKey';
  ascii?: Maybe<Scalars['String']>;
  base32?: Maybe<Scalars['String']>;
  hex?: Maybe<Scalars['String']>;
  qr_code_ascii?: Maybe<Scalars['String']>;
  qr_code_hex?: Maybe<Scalars['String']>;
  qr_code_base32?: Maybe<Scalars['String']>;
  google_auth_qr?: Maybe<Scalars['String']>;
  otpauth_url?: Maybe<Scalars['String']>;
};

export type TwoFactorSecretKeyInput = {
  ascii?: Maybe<Scalars['String']>;
  base32?: Maybe<Scalars['String']>;
  hex?: Maybe<Scalars['String']>;
  qr_code_ascii?: Maybe<Scalars['String']>;
  qr_code_hex?: Maybe<Scalars['String']>;
  qr_code_base32?: Maybe<Scalars['String']>;
  google_auth_qr?: Maybe<Scalars['String']>;
  otpauth_url?: Maybe<Scalars['String']>;
};

export type UpdateClosingInput = {
  salesIds: Array<Scalars['ID']>;
  spentItems: Array<SpentItemsInput>;
  receivedItems: Array<ReceivedItemsInput>;
  inHandTotal: Scalars['Float'];
  spentTotal: Scalars['Float'];
  active: Scalars['Boolean'];
  shop?: Maybe<Scalars['ID']>;
  _id: Scalars['ID'];
};

export type UpdateItemsInput = {
  _id: Scalars['ID'];
  name: Scalars['String'];
  category?: Maybe<Scalars['String']>;
  price?: Maybe<PriceInput>;
  stock: Scalars['Float'];
};

export type UpdatePurchaseInput = {
  items: Array<PurchaseItemInput>;
  vendor?: Maybe<Scalars['String']>;
  contact?: Maybe<Scalars['String']>;
  email?: Maybe<Scalars['String']>;
  total: Scalars['Float'];
  discount?: Maybe<Scalars['Float']>;
  shop?: Maybe<Scalars['ID']>;
  _id: Scalars['ID'];
};

export type UpdateSaleInput = {
  items: Array<SaleItemInput>;
  customer?: Maybe<Scalars['String']>;
  contact?: Maybe<Scalars['String']>;
  email?: Maybe<Scalars['String']>;
  total: Scalars['Float'];
  discount?: Maybe<Scalars['Float']>;
  profit: Scalars['Float'];
  loss: Scalars['Float'];
  shop?: Maybe<Scalars['ID']>;
  _id: Scalars['ID'];
};

/** The User model */
export type User = {
   __typename?: 'User';
  id: Scalars['ID'];
  emails?: Maybe<Array<EmailRecord>>;
  username?: Maybe<Scalars['String']>;
  _id: Scalars['ID'];
  firstName: Scalars['String'];
  lastName: Scalars['String'];
  fullName: Scalars['String'];
  roles: Array<Roles>;
  role: Roles;
  shop?: Maybe<Shop>;
  createdAt: Scalars['DateTime'];
  updatedAt: Scalars['DateTime'];
};

export type UserInput = {
  id?: Maybe<Scalars['ID']>;
  email?: Maybe<Scalars['String']>;
  username?: Maybe<Scalars['String']>;
};

export type VendorInfo = {
   __typename?: 'VendorInfo';
  id: Scalars['String'];
  name: Scalars['String'];
  charges?: Maybe<Charges>;
};

