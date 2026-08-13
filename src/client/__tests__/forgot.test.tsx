/**
 * @jest-environment jsdom
 */
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import { system } from '../styles/theme';
import { Forgot } from '../pages/forgot';

jest.mock('@apollo/client', () => {
  const actual = jest.requireActual('@apollo/client');
  return {
    ...actual,
    useMutation: (): any => [
      (obj: any) => {
        const email = obj.variables.email;
        if (email === 'nosuchuser@test.com') {
          return Promise.resolve({ data: { sendResetPasswordEmail: false } });
        }
        if (email === 'john.doe@john.com') {
          return Promise.resolve({ data: { sendResetPasswordEmail: true } });
        }
      },
      {},
    ],
  };
});

jest.mock('next/router', () => ({
  __esModule: true,
  useRouter: () => ({
    query: {
      from: 'reset',
    },
  }),
}));

describe('Forgot password page', () => {
  const renderForgot = () =>
    render(
      <ChakraProvider value={system}>
        <Forgot />
      </ChakraProvider>,
    );

  it('renders as expected', () => {
    const { container } = renderForgot();
    expect(container).toMatchSnapshot();
  });

  it('shows an error message in case of invalid email address', async () => {
    renderForgot();
    fireEvent.change(screen.getByPlaceholderText('Enter email'), {
      target: { value: 'invalid@invalid' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Send reset email' }));
    await waitFor(() =>
      expect(screen.getByText('Invalid email address')).toBeInTheDocument(),
    );
  });

  it('shows an error message when no user is found', async () => {
    renderForgot();
    fireEvent.change(screen.getByPlaceholderText('Enter email'), {
      target: { value: 'nosuchuser@test.com' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Send reset email' }));
    await waitFor(() =>
      expect(screen.getByText('User not found.')).toBeInTheDocument(),
    );
  });

  it('shows a success message when email is sent', async () => {
    renderForgot();
    fireEvent.change(screen.getByPlaceholderText('Enter email'), {
      target: { value: 'john.doe@john.com' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Send reset email' }));
    await waitFor(() =>
      expect(
        screen.getByText(
          'An email with instructions to reset password has been sent.',
        ),
      ).toBeInTheDocument(),
    );
  });

  it('shows the error message for expired token, when redirected from reset password page', () => {
    renderForgot();
    expect(
      screen.getByText(
        'Your password reset link is either invalid or expired. Create a new link below.',
      ),
    ).toBeInTheDocument();
  });
});
