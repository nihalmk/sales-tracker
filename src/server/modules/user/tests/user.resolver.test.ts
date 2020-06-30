import UserResolver from '../user.resolver';
import { CTX } from '../../../interfaces/common';
import { ObjectId } from 'mongodb';
import { user, userInput } from './user.data';

const mockUser = user;

jest.mock('../user.service');

import { UserService } from '../user.service';
import { CreateUserInput } from '../user.input';

jest.mock('../../../../accounts/setup', () => {
  return {
    getAccounts: jest.fn(() => ({
      accountsServer: {
        findUserById: jest.fn(() => {
          return mockUser;
        }),
      },
    })),
    accountsPassword: {
      createUser: jest.fn(() => mockUser._id),
    },
  };
});

const mockUserService = UserService as jest.Mock<UserService>;

let resolver: UserResolver;

describe('User Resolver', () => {
  beforeEach(() => {
    mockUserService.mockClear();
    resolver = new UserResolver();
  });

  it('should call accountsServer.findUserById for resolver.me and get user', async () => {
    const ctx = {
      userId: '5cf8cb6ed09b120f4275e68d',
    } as CTX;
    const result = await resolver.me(ctx);
    expect(result).toEqual(mockUser);
  });

  it('should not call accountsServer.findUserById for resolver.me if ctx user is null', async () => {
    const ctx = {
      userId: undefined,
    } as CTX;
    const result = await resolver.me(ctx);
    expect(result).toEqual(undefined);
  });

  it('should get user by ID', async () => {
    const id = new ObjectId('5cf8cb6ed09b120f4275e68d');
    mockUserService.mock.instances[0].findById = jest.fn(async () => user);
    const result = await resolver.getUserById(id);
    expect(result).toEqual(user);
  });

  it('should create a new user', async () => {
    mockUserService.mock.instances[0].updateUser = jest.fn();
    await resolver.createNewUser(userInput as CreateUserInput);
    expect(mockUserService.mock.instances[0].updateUser).toBeCalledWith(
      mockUser._id,
      userInput,
    );
  });
});
