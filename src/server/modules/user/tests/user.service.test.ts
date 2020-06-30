import { user, userInput, userInput2 } from './user.data';
import { UserModel, Roles } from '../user.model';
import { UserService } from '../user.service';
import { ObjectId } from 'mongodb';
import { CreateUserInput } from '../user.input';

const mockUser = user;

jest.mock('../user.model');

const mockUserModel = (UserModel as unknown) as jest.Mock<typeof UserModel> &
  typeof UserModel;

let service: UserService;

describe('User Service', () => {
  beforeEach(() => {
    mockUserModel.mockClear();
    service = new UserService();
  });

  it('should get user by id', async () => {
    const id = new ObjectId('5cf8cb6ed09b120f4275e68d');
    UserModel.findById = jest.fn((): any => user);
    const result = await service.findById(id);
    expect(result).toEqual(mockUser);
  });

  it('should update user by id', async () => {
    const id = new ObjectId('5cf8cb6ed09b120f4275e68d');
    UserModel.findOneAndUpdate = jest.fn();
    await service.updateUser(id, userInput as CreateUserInput);
    expect(UserModel.findOneAndUpdate).toBeCalledWith(
      {
        _id: id,
      },
      {
        $set: {
          roles: userInput.roles,
          firstName: userInput.firstName,
          lastName: userInput.lastName,
          role: Roles.Admin,
        },
      },
    );
  });

  it('should update user by id with Runner role if roles empty', async () => {
    const id = new ObjectId('5cf8cb6ed09b120f4275e68d');
    UserModel.findOneAndUpdate = jest.fn();
    await service.updateUser(id, userInput2 as CreateUserInput);
    expect(UserModel.findOneAndUpdate).toBeCalledWith(
      {
        _id: id,
      },
      {
        $set: {
          roles: userInput2.roles,
          firstName: userInput2.firstName,
          lastName: userInput2.lastName,
          role: Roles.Runner,
        },
      },
    );
  });
});
