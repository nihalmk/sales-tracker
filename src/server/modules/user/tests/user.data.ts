import { UserModel, Roles } from '../user.model';
import { ObjectId } from 'mongodb';

export const userInput = {
  email: 'john.doe@john.com',
  password: 'johnspassword',
  roles: ['Admin', 'Runner'] as Roles[],
  firstName: 'John',
  lastName: 'Doe',
};

export const userInput2 = {
  email: 'john.doe@john.com',
  password: 'johnspassword',
  roles: [] as Roles[],
  firstName: 'John',
  lastName: 'Doe',
};

export const validUser = {
  _id: new ObjectId('5cf8cb6ed09b120f4275e68d'),
  firstName: 'John',
  lastName: 'Doe',
  role: 'Admin',
  roles: ['Admin', 'Runner'],
};

export const user = new UserModel(validUser);
