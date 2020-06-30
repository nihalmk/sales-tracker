import 'jsdom-global/register';
import React from 'react';
import { shallow } from 'enzyme';
import { act } from 'react-dom/test-utils';
import { Reset } from '../pages/reset-password/[token]';
import cookie from 'js-cookie';

jest.mock('next/router', () => ({
  __esModule: true,
  useRouter: () => ({
    query: {
      token: 'randomtoken',
    },
    push: () => {},
  }),
}));

jest.mock('../../accounts/client', () => ({
  accountsPassword: {
    resetPassword: jest.fn(() => ({
      tokens: { accessToken: 'abcd' },
    })),
  },
}));

describe('The reset password page', () => {
  let wrapper: any, passwordTxt: any, confirmPasswordTxt: any;
  beforeEach(() => {
    wrapper = shallow(<Reset />);
    passwordTxt = wrapper.find('#password').props();
    confirmPasswordTxt = wrapper.find('#confirmPassword').props();
  });

  it('renders as expected', async () => {
    const snapshot = shallow(<Reset />);
    expect(snapshot).toMatchSnapshot();
  });

  it('does not allow submit if password is blank', () => {
    const submitBtn = wrapper.find('button').first();
    expect(submitBtn.html()).toContain('disabled');
  });

  it('does not allow submit if password and confirm password are different', async () => {
    act(() => {
      passwordTxt.onChange({
        target: {
          value: 'abc',
        },
      } as React.ChangeEvent<HTMLInputElement>);
    });
    wrapper.update();
    act(() => {
      confirmPasswordTxt.onChange({
        target: {
          value: 'xyz',
        },
      } as React.ChangeEvent<HTMLInputElement>);
    });
    wrapper.update();
    const submitBtn = wrapper.find('button').first();
    expect(submitBtn.html()).toContain('disabled');
  });

  it('allows submit if password and confirm password are the same', () => {
    act(() => {
      passwordTxt.onChange({
        target: {
          value: 'abc',
        },
      } as React.ChangeEvent<HTMLInputElement>);
    });
    wrapper.update();
    act(() => {
      confirmPasswordTxt.onChange({
        target: {
          value: 'abc',
        },
      } as React.ChangeEvent<HTMLInputElement>);
    });
    wrapper.update();
    const submitButton = wrapper.find('button').first();
    expect(submitButton.html()).not.toContain('disabled');
  });

  it('sets token in cookie after a successful password reset', async () => {
    const cookieSet = jest.spyOn(cookie, 'set');
    act(() => {
      passwordTxt.onChange({
        target: {
          value: 'abc',
        },
      } as React.ChangeEvent<HTMLInputElement>);
    });
    wrapper.update();
    act(() => {
      confirmPasswordTxt.onChange({
        target: {
          value: 'abc',
        },
      } as React.ChangeEvent<HTMLInputElement>);
    });
    wrapper.update();
    const submitButton = wrapper.find('button').first();
    await act(async () => {
      submitButton.simulate('click');
    });
    expect(cookieSet).toHaveBeenCalledWith('token', 'abcd', { expires: 1 });
  });
});
