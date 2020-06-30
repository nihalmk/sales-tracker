import { UserModel } from '../user.model';

describe('User Model', () => {
  it('should have all required fields', () => {
    expect(UserModel.schema.obj).toHaveProperty('firstName');
    expect(UserModel.schema.obj).toHaveProperty('lastName');
  });

  it('should have timestamps feature activated', () => {
    //@ts-ignore
    expect(UserModel.schema.options).toMatchObject({
      timestamps: true,
    });
    //@ts-ignore
    expect(UserModel.schema['$timestamps']).toMatchObject({
      createdAt: 'createdAt',
      updatedAt: 'updatedAt',
    });
  });
});
