/**
 * @jest-environment jsdom
 */
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import { system } from '../styles/theme';
import { Login } from '../pages/login';
import { login } from '../accounts/login';
import { user } from '../__stubs__/login.data';

let mockUser: any;

let mockUserData: any = {
  data: {
    me: mockUser,
  },
};
jest.mock('../accounts/login');
jest.mock('next/router', () => {
  return {
    useRouter: jest.fn(() => ({
      push: jest.fn(),
    })),
  };
});

jest.mock('@apollo/client', () => {
  const actual = jest.requireActual('@apollo/client');
  return {
    ...actual,
    useQuery: (query: any): any => {
      if (!query) {
        return { data: {}, loading: false, error: true };
      }
      const mockQueryName = query.definitions[0].name.value;
      switch (mockQueryName) {
        case 'Me':
          return mockUserData;
        default: {
          return { data: null, error: true };
        }
      }
    },
  };
});

const mockLogin = login as unknown as jest.Mock<typeof login> & typeof login;

const renderLogin = () =>
  render(
    <ChakraProvider value={system}>
      <Login />
    </ChakraProvider>,
  );

describe('Login Page', () => {
  beforeAll(() => {
    mockUserData = {
      data: {
        me: null,
      },
    };
  });

  beforeEach(() => {
    mockLogin.mockClear();
  });

  it('Login page snapshot', () => {
    const { container } = renderLogin();
    expect(container).toMatchSnapshot();
  });

  it('Login Page should be loaded and submitted for login', async () => {
    renderLogin();
    fireEvent.change(screen.getByPlaceholderText('Enter email'), {
      target: { value: 'email@email.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('Password'), {
      target: { value: 'password' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Log in' }));
    await waitFor(() =>
      expect(mockLogin).toHaveBeenCalledWith('email@email.com', 'password'),
    );
  });

  it('Login Page should be loaded and should throw error for validation', async () => {
    renderLogin();
    fireEvent.change(screen.getByPlaceholderText('Enter email'), {
      target: { value: 'email@email.com' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Log in' }));
    await waitFor(() =>
      expect(screen.getByText('Email/Password required')).toBeInTheDocument(),
    );
    expect(mockLogin).not.toHaveBeenCalledWith('email@email.com', 'password');
  });

  it('Login Page should be loaded and should throw error on login', async () => {
    mockLogin.mockRejectedValueOnce(new Error('Invalid Credentials') as never);
    renderLogin();
    fireEvent.change(screen.getByPlaceholderText('Enter email'), {
      target: { value: 'email@email.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('Password'), {
      target: { value: 'password' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Log in' }));
    await waitFor(() =>
      expect(screen.getByText('Invalid Credentials')).toBeInTheDocument(),
    );
    expect(mockLogin).toHaveBeenCalledWith('email@email.com', 'password');
  });
});

describe('Login Page with user already logged in', () => {
  beforeAll(() => {
    mockUserData = {
      data: {
        me: user,
      },
    };
  });

  it('Login page snapshot', () => {
    const { container } = renderLogin();
    expect(container).toMatchSnapshot();
  });

  it('Login Page should not be shown', () => {
    renderLogin();
    expect(screen.queryByPlaceholderText('Enter email')).toBeNull();
    expect(screen.queryByPlaceholderText('Password')).toBeNull();
    expect(screen.queryByRole('button', { name: 'Log in' })).toBeNull();
  });
});
