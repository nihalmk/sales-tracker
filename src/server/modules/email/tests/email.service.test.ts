import { Emailer, EmailTemplates } from '../email.service';
import Mailgun from 'mailgun-js';

/* eslint-disable @typescript-eslint/no-explicit-any */
jest.mock('mailgun-js');

const emailContext = {
  from: 'hfc@honestfoodcompany.de',
  to: 'testemail@email.com',
  subject: 'Email Subject',
  text: 'Email text body',
};

describe('Emailer', () => {
  let emailer: Emailer;

  beforeEach(() => {
    process.env.MAILGUN_API_KEY = 'MAILGUN_API_KEY';
    process.env.MAILGUN_DOMAIN = 'MAILGUN_DOMAIN';
    emailer = new Emailer();
  });

  it('Mailgun() should be called', async () => {
    try {
      await emailer.sendEmail(emailContext);
    } catch (e) {}
    expect(Mailgun).toHaveBeenCalled();
  });

  it('should get the subject from mail templates', async () => {
    expect(EmailTemplates.Templates.resetPassword.subject()).toEqual(
      'Password reset request',
    );
    expect(EmailTemplates.Templates.passwordChanged.subject()).toEqual(
      'Honest Food | No reply',
    );
  });

  it('should get the text from mail templates', async () => {
    expect(
      EmailTemplates.Templates.resetPassword.text(
        null,
        'http://example.com/reset/token',
      ),
    ).toEqual(
      `To reset your password, please click on this link: http://example.com/reset/token`,
    );
    expect(
      EmailTemplates.Templates.passwordChanged.text(
        null,
        'http://example.com/reset/token',
      ),
    ).toEqual('This is a test mail: http://example.com/reset/token');
  });

  it('should throw error when initialising emailer if MAILGUN_API_KEY not defined', async () => {
    let result;
    try {
      delete process.env.MAILGUN_API_KEY;
      let emailerMock: Emailer;
      emailerMock = new Emailer();
      await emailerMock.sendEmail(emailContext);
    } catch (e) {
      result = e;
    }
    expect(result.message).toEqual(`'MAILGUN_API_KEY' required for mailgun`);
  });

  it('should throw error when initialising emailer if MAILGUN_DOMAIN not defined', async () => {
    let result;
    try {
      delete process.env.MAILGUN_DOMAIN;
      let emailerMock: Emailer;
      emailerMock = new Emailer();
      await emailerMock.sendEmail(emailContext);
    } catch (e) {
      result = e;
    }
    expect(result.message).toEqual(`'MAILGUN_DOMAIN' required for mailgun`);
  });
});
