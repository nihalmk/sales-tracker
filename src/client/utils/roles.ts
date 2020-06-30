import _ from 'lodash';
import { Roles } from '../generated/graphql';
import { LabelValueObj } from '../components/common/SelectBoxes/SelectBox';

const roleHierarchy = [Roles.Admin, Roles.Manager, Roles.Sales];

export const getUserRoleMap = (
  highestRole: string = Roles.Admin,
): LabelValueObj[] => {
  let roleMap: LabelValueObj[] = [];
  let highestRank = roleHierarchy.indexOf(highestRole as Roles);
  if (highestRank < 0) return [];
  highestRank = highestRank == 0 ? 0 : highestRank + 1;
  roleHierarchy.slice(highestRank, roleHierarchy.length).map((r) => {
    roleMap.push({
      label: r,
      value: r,
    });
  });
  return roleMap;
};

export const isUserAdmin = (user: { role: string }) => {
  return user.role.toLowerCase() === 'admin';
};

export const isUserSales = (user: { role: string }) => {
  return user.role.toLowerCase() === 'sales';
};

export const isUserManager = (user: { role: string }) => {
  return user.role.toLowerCase() === 'manager';
};

export const isUserAdminOrManager = (user: { role: string }) => {
  return isUserAdmin(user) || isUserManager(user);
};
