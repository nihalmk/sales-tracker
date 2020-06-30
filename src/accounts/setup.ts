import MongoDBInterface from '@accounts/mongo';
import { AccountsModule } from '@accounts/graphql-api';
import { DatabaseManager } from '@accounts/database-manager';
import { AccountsServer, generateRandomToken } from '@accounts/server';
import { AccountsPassword } from '@accounts/password';
import { Connection } from 'mongoose';
import { GraphQLModule } from '@graphql-modules/core';
import { Emailer } from '../server/modules/email/email.service';
import { Templates } from '../server/modules/common/templates';

export const accountsPassword = new AccountsPassword({
  passwordResetTokenExpiration: process.env.PASSWORD_RESET_TIMEOUT
    ? Number(process.env.PASSWORD_RESET_TIMEOUT)
    : 7200000,
  returnTokensAfterResetPassword: true,
  notifyUserAfterPasswordChanged: false,
});

let accountsGraphQL: GraphQLModule,
  accountsServer: AccountsServer,
  mongoConnection: Connection;

type setupAccountFunc = (
  connection: Connection,
) => { accountsGraphQL: GraphQLModule; accountsServer: AccountsServer };

export const setUpAccounts: setupAccountFunc = (connection) => {
  // Save createdAt and updatedAt in date format. For complete list of options.
  // https://accounts-js.netlify.com/docs/databases/mongo.
  const options = {
    dateProvider: (date: Date | undefined): Date => (date ? date : new Date()),
    convertAuthenticatorIdToMongoObjectId: true,
    convertMfaChallengeIdToMongoObjectId: true,
  };

  const userStorage = new MongoDBInterface(connection, options);

  const accountsDb = new DatabaseManager({
    sessionStorage: userStorage,
    userStorage,
  });

  const emailer = new Emailer();

  accountsServer = new AccountsServer(
    {
      db: accountsDb,
      tokenSecret:
        process.env.ACCOUNTS_SECRET || 'SALES!TRACKER#WEB^ACCOUNTS(SECRET',
      siteUrl: `${process.env.SERVER_URL || 'http://localhost:3000'}`,
      sendMail: emailer.sendEmail,
      emailTemplates: {
        from: 'Thavakkal <no-reply@thavakkal.com>',
        resetPassword: Templates.ResetPasswordTemplate,
        verifyEmail: Templates.DefaultTemplate,
        enrollAccount: Templates.DefaultTemplate,
        passwordChanged: Templates.DefaultTemplate,
      },
      tokenConfigs: {
        accessToken: {
          expiresIn: '7d',
        },
        refreshToken: {
          expiresIn: '100y',
        },
      },
      createNewSessionTokenOnRefresh: true,
    },
    {
      password: accountsPassword,
    },
  );

  accountsGraphQL = AccountsModule.forRoot({
    accountsServer,
  });

  mongoConnection = connection;

  return { accountsGraphQL, accountsServer };
};

type getAccountFunc = () => {
  accountsGraphQL: GraphQLModule;
  accountsServer: AccountsServer;
  mongoConnection: Connection;
};

export const getAccounts: getAccountFunc = () => {
  return { accountsGraphQL, accountsServer, mongoConnection };
};

export const generateTokenForAccount = (): string => {
  return generateRandomToken();
};
