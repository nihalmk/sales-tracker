import { Templates, CustomEmailTemplateType } from '../common/templates';
import Mailgun from 'mailgun-js';
import { User } from '../user/user.model';

export interface MailContext {
  from?: string;
  to?: string;
  subject?: string;
  text?: string;
  html?: string;
}

let mailgun: any;
const mailFrom = 'Thavakkal <no-reply@thavakkal.com>';

/**
 * Provide `MAILGUN_API_KEY` and `MAILGUN_DOMAIN` for mailgun credentials in `.env` file
 *
 * For login related emails(resetPassword, verifyEmail, etc..), `@accounts-js` make
 * use of `sendEmail`.
 * `sendEmail` method along with email templates are passed
 * during accounts setup in `modules/common/accounts.ts`
 *
 *
 * For custom emails, create an object of type `MailContext` and call `sendEmail` method.
 * Add new templates in `modules/common/Templates` folder
 */
export class Emailer {
  constructor() {
    if (!process.env.MAILGUN_API_KEY) {
      throw new Error(`'MAILGUN_API_KEY' required for mailgun`);
    }
    if (!process.env.MAILGUN_DOMAIN) {
      throw new Error(`'MAILGUN_DOMAIN' required for mailgun`);
    }
    if (!mailgun) {
      mailgun = Mailgun({
        apiKey: process.env.MAILGUN_API_KEY,
        domain: process.env.MAILGUN_DOMAIN,
      });
    }
  }

  async sendEmail(mailContext: MailContext): Promise<void> {
    var data = {
      from: mailContext.from,
      to: mailContext.to,
      subject: mailContext.subject,
      text: mailContext.text,
      html: mailContext.html,
    };
    return new Promise(function (resolve, reject) {
      mailgun.messages().send(data, function (error: any, body: any) {
        if (error) {
          reject(`Unable to send mail: ${error.message}`);
        }
        resolve(body);
      });
    });
  }
}

/**
 * This is for @accounts-js for login related template setup
 */
export const EmailTemplates = {
  Templates: {
    from: mailFrom,
    resetPassword: Templates.ResetPasswordTemplate,
    verifyEmail: Templates.DefaultTemplate,
    enrollAccount: Templates.DefaultTemplate,
    passwordChanged: Templates.DefaultTemplate,
  },
};

/**
 * This is for sending custom emails. templates need to be defined
 * in `modules/common/Templates` folder
 * Use this method to generate `mailContext` for `sendEmail` method for custom
 * emails
 * @param mailContext - Accept custom mail subject and html defined in Templates file
 * @param options - User, Url and to info
 */
export const getContextFromTemplate = (
  mailContext: CustomEmailTemplateType,
  options: { to: string; user: User | null; url: string },
): Record<string, {} | string> => {
  return {
    from: mailFrom,
    to: options.to,
    subject: mailContext.subject(),
    html: mailContext.html(options.user, options.url),
  };
};

export const MailTemplateUrls = {
  Invitation: `${
    process.env.SERVER_URL || 'http://localhost:3000'
  }/reset-password/`,
};
