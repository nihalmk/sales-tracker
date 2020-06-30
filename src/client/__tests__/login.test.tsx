import 'jsdom-global/register';
import React from 'react';
import { mount, shallow, ReactWrapper } from 'enzyme';
import { act } from 'react-dom/test-utils';
import { Login } from '../pages/login';
import { login } from '../accounts/login';
import { user } from '../__stubs__/login.data';
import { createSerializer } from 'enzyme-to-json';
import Loader from '../components/Loaders/Loader';
import ErrorMessage from '../components/Errors/ErrorMessage';

expect.addSnapshotSerializer(createSerializer({ mode: 'deep' }) as any);

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

jest.mock('@apollo/react-hooks', () => ({
  __esModule: true,
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
}));

let wrapper: ReactWrapper;
const mockLogin = (login as unknown) as jest.Mock<typeof login> & typeof login;

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
    const snap = shallow(<Login />);
    expect(snap).toMatchSnapshot();
  });

  it('Login Page should be loaded and submitted for login', () => {
    wrapper = mount(<Login />);
    const email = wrapper.find('#email').first().props();
    const password = wrapper.find('#userPassword').first().props();
    const loginButton = wrapper.find('button').first();
    act(() => {
      email.onChange({
        target: {
          value: 'email@email.com',
        },
      } as React.ChangeEvent<HTMLInputElement>);
      password.onChange({
        target: {
          value: 'password',
        },
      } as React.ChangeEvent<HTMLInputElement>);
    });
    wrapper.update();
    act(() => {
      loginButton.simulate('click');
    });
    expect(mockLogin).toBeCalledWith('email@email.com', 'password');
  });

  it('Login Page should be loaded and should throw error for validation', () => {
    wrapper = mount(<Login />);
    const email = wrapper.find('#email').first().props();
    const loginButton = wrapper.find('button').first();
    act(() => {
      email.onChange({
        target: {
          value: 'email@email.com',
        },
      } as React.ChangeEvent<HTMLInputElement>);
    });
    wrapper.update();
    act(() => {
      loginButton.simulate('click');
    });
    expect(mockLogin).not.toBeCalledWith('email@email.com', 'password');
  });

  it('Login Page should be loaded and should throw error on login', async () => {
    wrapper = mount(<Login />);
    const email = wrapper.find('#email').first().props();
    const password = wrapper.find('#userPassword').first().props();
    const loginButton = wrapper.find('button').first();
    mockLogin.mockRejectedValueOnce(new Error('Invalid Credentials') as never);
    act(() => {
      email.onChange({
        target: {
          value: 'email@email.com',
        },
      } as React.ChangeEvent<HTMLInputElement>);
      password.onChange({
        target: {
          value: 'password',
        },
      } as React.ChangeEvent<HTMLInputElement>);
    });
    wrapper.update();
    await act(async () => {
      loginButton.simulate('click');
      await Promise.resolve();
    });
    wrapper.update();
    const error = wrapper.find(ErrorMessage).first();
    expect(mockLogin).toBeCalledWith('email@email.com', 'password');
    expect(error.html()).toContain('Invalid Credentials');
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
    const snap = shallow(<Login />);
    expect(snap).toMatchSnapshot();
  });

  it('Login Page should not be shown', () => {
    wrapper = mount(<Login />);
    const email = wrapper.find('#email').first();
    const password = wrapper.find('#userPassword').first();
    const loginButton = wrapper.find('button');
    const loader = wrapper.find(Loader);
    expect(email).toEqual({});
    expect(password).toEqual({});
    expect(loginButton).toEqual({});
    expect(loader).toBeTruthy();
  });
});
