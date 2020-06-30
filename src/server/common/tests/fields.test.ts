import {
  DateField,
  VendorField,
  NumberField,
  StringField,
  BooleanField,
  ChannelField,
  PaymentField,
  ProfileField,
} from '../fields';
import { VendorInfo, Channel, Payment, Profile } from '../../interfaces/order';

describe('Tests @Fields', () => {
  it('Tests all the @Fields', () => {
    expect(StringField()).toBe(String);
    expect(NumberField()).toBe(Number);
    expect(JSON.stringify(VendorField())).toBe(JSON.stringify([VendorInfo]));
    expect(DateField()).toBe(Date);
    expect(BooleanField()).toBe(Boolean);
    expect(ChannelField()).toBe(Channel);
    expect(PaymentField()).toBe(Payment);
    expect(ProfileField()).toBe(Profile);
  });
});
