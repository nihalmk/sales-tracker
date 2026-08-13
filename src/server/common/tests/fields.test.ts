import { DateField, NumberField, StringField, BooleanField } from '../fields';

describe('Tests @Fields', () => {
  it('Tests all the @Fields', () => {
    expect(StringField()).toBe(String);
    expect(NumberField()).toBe(Number);
    expect(DateField()).toBe(Date);
    expect(BooleanField()).toBe(Boolean);
  });
});
