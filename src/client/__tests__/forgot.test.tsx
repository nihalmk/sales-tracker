import 'jsdom-global/register';
import React from 'react';
import { mount, shallow } from 'enzyme';
import { act } from 'react-dom/test-utils';
import { Forgot } from './../pages/forgot';

jest.mock('@apollo/react-hooks', () => ({
  __esModule: true,
  useMutation: (): any => [
    (obj: any) => {
      const email = obj.variables.email;
      if (email === 'nosuchuser@test.com') {
        return {
          data: { sendResetPasswordEmail: false },
        };
      }
      if (email === 'john.doe@john.com') {
        return {
          data: { sendResetPasswordEmail: true },
        };
      }
    },
    {},
  ],
}));

jest.mock('next/router', () => ({
  __esModule: true,
  useRouter: () => ({
    query: {
      from: 'reset',
    },
  }),
}));

describe('Forgot password page', () => {
  let wrapper: any, email: any, sendButton: any;
  beforeEach(() => {
    wrapper = mount(<Forgot />);
    email = wrapper.find('#email').first().props();
    sendButton = wrapper.find('button').first();
  });

  it('renders as expected', async () => {
    const snapshot = shallow(<Forgot />);
    expect(snapshot).toMatchSnapshot();
  });

  it('shows an error message in case of invalid email address', async () => {
    act(() => {
      email.onChange({
        target: {
          value: 'invalid@invalid',
        },
      });
    });
    wrapper.update();
    await act(async () => {
      sendButton.simulate('click');
    });
    wrapper.update();
    const notification = wrapper.find('#notification');
    expect(notification.text()).toEqual('Invalid email address');
    expect(notification.find('.alert-danger').length).toEqual(1);
  });

  it('shows an error message when no user is found', async () => {
    act(() => {
      email.onChange({
        target: {
          value: 'nosuchuser@test.com',
        },
      });
    });

    await act(async () => {
      sendButton.simulate('click');
    });
    wrapper.update();
    const notification = wrapper.find('#notification');
    expect(notification.text()).toEqual('User not found.');
    expect(notification.find('.alert-danger').length).toEqual(1);
  });

  it('shows a success message when email is sent', async () => {
    act(() => {
      email.onChange({
        target: {
          value: 'john.doe@john.com',
        },
      } as React.ChangeEvent<HTMLInputElement>);
    });

    await act(async () => {
      sendButton.simulate('click');
    });
    wrapper.update();
    const notification = wrapper.find('#notification');
    expect(notification.text()).toEqual(
      'An email with instructions to reset password has been sent.',
    );
    expect(notification.find('.alert-success').length).toEqual(1);
  });

  it('shows the error message for expired token, when redirected from reset password page', async () => {
    wrapper = await mount(<Forgot />);
    const notification = wrapper.find('#notification');
    expect(notification.text()).toEqual(
      'Your password reset link is either invalid or expired. Create a new link below.',
    );
    expect(notification.find('.alert-danger').length).toEqual(1);
  });
});
