/**
 * @jest-environment jsdom
 */
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import { system } from '../styles/theme';
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
  const renderReset = () =>
    render(
      <ChakraProvider value={system}>
        <Reset />
      </ChakraProvider>,
    );
  const getPasswordInput = (): HTMLInputElement =>
    document.querySelector('#password');
  const getConfirmPasswordInput = (): HTMLInputElement =>
    document.querySelector('#confirmPassword');

  it('renders as expected', () => {
    const { container } = renderReset();
    expect(container).toMatchSnapshot();
  });

  it('does not allow submit if password is blank', () => {
    renderReset();
    const submitBtn = screen.getByRole('button', { name: 'Reset password' });
    expect(submitBtn).toBeDisabled();
  });

  it('does not allow submit if password and confirm password are different', () => {
    renderReset();
    fireEvent.change(getPasswordInput(), { target: { value: 'abc' } });
    fireEvent.change(getConfirmPasswordInput(), { target: { value: 'xyz' } });
    const submitBtn = screen.getByRole('button', { name: 'Reset password' });
    expect(submitBtn).toBeDisabled();
  });

  it('allows submit if password and confirm password are the same', () => {
    renderReset();
    fireEvent.change(getPasswordInput(), { target: { value: 'abc' } });
    fireEvent.change(getConfirmPasswordInput(), { target: { value: 'abc' } });
    const submitBtn = screen.getByRole('button', { name: 'Reset password' });
    expect(submitBtn).not.toBeDisabled();
  });

  it('sets token in cookie after a successful password reset', async () => {
    const cookieSet = jest.spyOn(cookie, 'set');
    renderReset();
    fireEvent.change(getPasswordInput(), { target: { value: 'abc' } });
    fireEvent.change(getConfirmPasswordInput(), { target: { value: 'abc' } });
    fireEvent.click(screen.getByRole('button', { name: 'Reset password' }));
    await waitFor(() =>
      expect(cookieSet).toHaveBeenCalledWith('token', 'abcd', { expires: 1 }),
    );
  });
});
