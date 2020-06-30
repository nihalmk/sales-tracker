import { Context } from 'koa';
import { User } from '../modules/user/user.model';

export interface CTX extends Context {
  userId?: string;
  user?: User;
}
