import { ObjectId } from 'mongodb';
import { User, UserModel, Roles } from './user.model';
import { CreateUserInput } from './user.input';
import { getAccounts, generateTokenForAccount } from '../../../accounts/setup';
import {
  Emailer,
  getContextFromTemplate,
  MailTemplateUrls,
} from '../email/email.service';
import { Templates } from '../common/templates';

// Role hierarchy levels

export const roleHierarchy: { [key: string]: Roles } = {
  1: Roles.Admin,
  2: Roles.Manager,
  3: Roles.Sales,
};

// gets the role of the user from his roles list based on hierarchy

export const getRole = (roles: Roles[]): Roles => {
  if (roles.length === 0) {
    return Roles.Sales;
  }
  const hierarchies = Object.keys(roleHierarchy).map((h) => {
    return roles.includes(roleHierarchy[h]) && h;
  });
  hierarchies.sort();
  return roleHierarchy[hierarchies[0]];
};

export class UserService {
  readonly model: typeof UserModel;

  constructor() {
    this.model = UserModel;
  }

  // Get th euser by Id

  async findById(id: ObjectId): Promise<User | null> {
    return this.model.findById(id);
  }

  // Updates the user by id

  async updateUser(id: ObjectId, user: CreateUserInput): Promise<User> {
    return this.model.findOneAndUpdate(
      {
        _id: id,
      },
      {
        $set: {
          roles: user.roles,
          firstName: user.firstName,
          lastName: user.lastName,
          role: getRole(user.roles),
          ...(user.shop && { shop: user.shop }),
        },
      },
    );
  }

  async updateUserShop(id: ObjectId, shop: ObjectId): Promise<User> {
    return this.model.findOneAndUpdate(
      {
        _id: id,
      },
      {
        $set: {
          shop: shop,
        },
      },
    );
  }

  // switch user shop

  async switchShop(shopId: ObjectId, userId: ObjectId): Promise<User> {
    return this.model.findOneAndUpdate(
      {
        _id: userId,
      },
      {
        $set: {
          shop: shopId,
        },
      },
    );
  }

  async sendUserInvitation(
    createdUserId: string,
    user: CreateUserInput,
  ): Promise<void> {
    const { accountsServer } = getAccounts();
    const passwordToken = generateTokenForAccount();
    const accountServerDb = accountsServer.getOptions().db;

    if (!accountServerDb) {
      throw new Error(
        'Error while sending user invitation - Account server db is not defined',
      );
    }
    await accountServerDb.addResetPasswordToken(
      createdUserId,
      user.email,
      passwordToken,
      'reset',
    );
    const userInfo = await this.findOneById(createdUserId);
    const emailer = new Emailer();
    const mailContext = getContextFromTemplate(
      Templates.UserInvitationTemplate,
      {
        user: userInfo,
        to: user.email,
        url: `${MailTemplateUrls.Invitation}${passwordToken}`,
      },
    );
    await emailer.sendEmail(mailContext);
  }

  async findOneById(_id: string | ObjectId | undefined): Promise<User | null> {
    return this.model.findOne({ _id }).populate('shop');
  }
}
