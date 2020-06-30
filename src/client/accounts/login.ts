import { accountsPassword, accountsClient } from '../../accounts/client';
import { LoginResult } from '@accounts/graphql-api';
import cookie from 'js-cookie';
import { clientLogger } from '../utils/logger';

export const login = async (
  email: string,
  password: string,
): Promise<LoginResult> => {
  const loginResult = await accountsPassword.login({
    password: password,
    user: { email: email },
  });
  cookie.set('token', loginResult.tokens.accessToken, { expires: 1 });
  return loginResult;
};

export const logout = async (): Promise<void> => {
  cookie.remove('token');
  await accountsClient.logout();
};

export const validateToken = async (): Promise<void> => {
  try {
    // Using refresh session to get token. Access token expiry is 90 minutes and refresh token expiry is 7days.
    // In case, access token is expired due to inactivity, refresh token will be used to generate new access token.
    const tokens = await accountsClient.refreshSession();

    if (!tokens || !tokens.accessToken) {
      logout();
      return;
    }
    const tokenFromCookie = cookie.get('token');

    // If token is not there or token is refreshed, add new token
    if (!tokenFromCookie || tokenFromCookie !== tokens.accessToken) {
      cookie.set('token', tokens.accessToken, { expires: 1 });
    }
  } catch (e) {
    // log the error.
    clientLogger.error(
      'Error while refreshing session. Error - ',
      JSON.stringify(e),
    );
  }
};
