import { DefaultTemplate } from './default-template';
import { ResetPasswordTemplate } from './reset-password';
import { UserInvitationTemplate } from './user-invitation';
import { User } from '../../user/user.model';

export const Templates = {
  DefaultTemplate,
  ResetPasswordTemplate,
  UserInvitationTemplate,
};

export interface CustomEmailTemplateType {
  subject: (user?: User | null) => string;
  text: (user: User | null, url: string) => string;
  html: (user: User | null, url: string) => string;
}
