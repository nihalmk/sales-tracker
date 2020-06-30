import { VendorInfo, Profile, Channel, Payment } from '../interfaces/order';

export const StringField = () => String;

export const NumberField = () => Number;

export const VendorField = () => [VendorInfo];

export const DateField = () => Date;

export const BooleanField = () => Boolean;

export const ProfileField = () => Profile;

export const ChannelField = () => Channel;

export const PaymentField = () => Payment;
