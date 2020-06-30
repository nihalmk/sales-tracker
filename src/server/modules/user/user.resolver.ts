import {
  Resolver,
  Query,
  Authorized,
  Ctx,
  registerEnumType,
  Mutation,
  ID,
  Arg,
  FieldResolver,
  Root,
} from 'type-graphql';
import { getAccounts, accountsPassword } from '../../../accounts/setup';
import { CTX } from '../../interfaces/common';
import { User, Roles } from './user.model';
import { CreateUserInput } from './user.input';
import { UserService } from './user.service';
import { ObjectId } from 'mongodb';
import { Shop, ShopModel } from '../shop/shop.model';

const { accountsServer } = getAccounts();

// Register Roles to export them to schema

registerEnumType(Roles, {
  name: 'Roles',
});

/**
 * Mutations and Queries for getting user / updating user data
 */
@Resolver(User)
export default class UserResolver {
  readonly userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  // Queries

  // Get user from request ctx

  @Query((_returns) => User, { nullable: true })
  @Authorized()
  async me(@Ctx() ctx: CTX): Promise<User | null | void> {
    if (ctx.userId) {
      return ((await accountsServer.findUserById(
        ctx.userId,
      )) as unknown) as User;
    }
  }

  // Get user by given id

  @Query((_returns) => User, { nullable: true })
  @Authorized()
  async getUserById(
    @Arg('id', (_returns) => ID) id: ObjectId,
  ): Promise<User | null> {
    return this.userService.findById(id);
  }

  // Mutations

  // this overrides accounts js `createUser` function to create new user
  @Mutation((_returns) => ID)
  @Authorized([Roles.Admin])
  async createNewUser(
    @Arg('user', (_returns) => CreateUserInput) user: CreateUserInput,
  ): Promise<ObjectId> {
    const createdUserId = await accountsPassword.createUser({
      email: user.email,
      password: user.password,
    });
    // updates user after accountsPassword creates user
    await this.userService.updateUser(
      (createdUserId as unknown) as ObjectId,
      user,
    );
    return (createdUserId as unknown) as ObjectId;
  }

  // Overrides sending password reset email to check if the user exists
  // Send email only if Active user exists
  @Mutation((_returns) => Boolean)
  async sendResetPasswordEmail(
    @Arg('email', (_returns) => String) email: string,
  ): Promise<boolean> {
    const userExists = (await accountsPassword.findUserByEmail(
      email,
    )) as Partial<User>;
    let isActiveUser = userExists !== null;
    if (isActiveUser) {
      await accountsPassword.sendResetPasswordEmail(email);
    }
    return isActiveUser;
  }

  // Field Resolvers
  @FieldResolver()
  async shop(@Root() user: User): Promise<Shop | null> {
    return await ShopModel.findById(user.shop);
  }
}
