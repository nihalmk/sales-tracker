import { AuthChecker } from 'type-graphql';
import { CTX } from '../interfaces/common';
import { Roles } from '../modules/user/user.model';

export const authChecker: AuthChecker<CTX> = ({ context }, roles: Roles[]) => {
  const { user } = context;
  if (!user) {
    return false;
  }

  if (roles && roles.length > 0 && roles.includes(user.role)) {
    return true;
  }
  if (user.role) {
    return true;
  }
  return false;
};
