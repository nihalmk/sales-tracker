import { createContext } from 'react';
import { User } from '../../generated/graphql';

interface Context {
  user?: User;
  loading?: boolean;
  clearContext?: Function;
  refetchUser?: Function;
}
const UserContext = createContext({} as Context);

export default UserContext;
