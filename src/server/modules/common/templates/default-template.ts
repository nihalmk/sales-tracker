import { User } from '@accounts/types';

export interface EmailTemplateType {
  subject: (user?: User | null) => string;
  text: (user: User | null, url: string) => string;
  html: (user: User | null, url: string) => string;
}

export const DefaultTemplate: EmailTemplateType = {
  subject: () => `Honest Food | No reply`,
  text: (_user: User | null, url: string) => {
    return `This is a test mail: ${url}`;
  },
  html: (_user: User | null, _url: string) => {
    return `<p>This is a test mail</p>
				  <p>This is a test mail</p>
				  <button>This is a test mail</button>`;
  },
};
