const mockLogout = jest.fn();
const mockRefreshSession = jest.fn();

jest.mock('../../../accounts/client', () => {
  return {
    accountsPassword: {
      login: jest.fn(() => {
        return {
          tokens: {
            accessToken: 'testAccessToken',
          },
        };
      }),
    },
    accountsClient: {
      logout: mockLogout,
      refreshSession: mockRefreshSession,
    },
  };
});

const mockCookieGet = jest.fn();
const mockCookieSet = jest.fn();
const mockCookieRemove = jest.fn();

jest.mock('js-cookie', () => {
  return {
    get: mockCookieGet,
    set: mockCookieSet,
    remove: mockCookieRemove,
  };
});
import { login, logout, validateToken } from '../login';

describe('Accounts Login', () => {
  beforeEach(() => {
    mockCookieGet.mockClear();
    mockCookieSet.mockClear();
    mockCookieRemove.mockClear();
  });

  it('should test for login', async () => {
    const loginResult = await login('email@email.com', 'password');
    expect(loginResult.tokens.accessToken).toEqual('testAccessToken');
  });

  it('should test for logout', async () => {
    await logout();
    expect(mockLogout).toBeCalled();
    expect(mockCookieRemove).toBeCalled();
  });

  it('should validate token and refresh', async () => {
    mockRefreshSession.mockResolvedValueOnce({
      accessToken: 'accessToken1',
    });
    mockCookieGet.mockReturnValueOnce('accessToken2');
    await validateToken();
    expect(mockCookieSet).toBeCalled();
  });

  it('should validate token and not set if it is same token', async () => {
    mockRefreshSession.mockResolvedValueOnce({
      accessToken: 'accessToken2',
    });
    mockCookieGet.mockReturnValueOnce('accessToken2');
    await validateToken();
    expect(mockCookieSet).not.toBeCalled();
  });

  it('should logout if validate token does not return token', async () => {
    mockRefreshSession.mockResolvedValueOnce({
      accessToken: '',
    });
    mockCookieGet.mockReturnValueOnce('accessToken2');
    await validateToken();
    expect(mockCookieRemove).toBeCalled();
    expect(mockCookieGet).not.toBeCalled();
  });

  it('should throw error is something went wrong', async () => {
    mockRefreshSession.mockRejectedValueOnce('Unable to refresh token');
    mockCookieGet.mockReturnValueOnce('accessToken2');
    await validateToken();
    expect(mockCookieRemove).not.toBeCalled();
    expect(mockCookieGet).not.toBeCalled();
    expect(mockCookieSet).not.toBeCalled();
  });
});
