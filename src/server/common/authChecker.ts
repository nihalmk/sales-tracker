import { AuthChecker } from 'type-graphql';
import { CTX } from '../interfaces/common';
import { Roles } from '../modules/user/user.model';
import moment from 'moment-timezone';

export const authChecker: AuthChecker<CTX> = (
  { context, info },
  roles: Roles[],
) => {
  const { user } = context;
  if (!user) {
    return false;
  }
  if (
    info.fieldName !== 'me' &&
    moment(user.registeredAt).isBefore(moment().subtract(7, 'days')) &&
    !user.paid
  ) {
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
