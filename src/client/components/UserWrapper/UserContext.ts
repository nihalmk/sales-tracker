import { createContext } from 'react';
import { User } from '../../generated/graphql';

interface Context {
  user?: User;
  loading?: boolean;
  clearContext?: Function;
  refetchUser?: Function;
  enabledNavItems: {[key: string]: boolean};
  setNavItems?: (navItems: {[key: string]: boolean}) => void;
  setSelectedMenu?: (navItem: string) => void;
  selectedMenu?: string;
}
const UserContext = createContext({} as Context);

export default UserContext;
