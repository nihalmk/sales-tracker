/**
 * @jest-environment jsdom
 */
import { render, screen, fireEvent } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import { system } from '../../../styles/theme';
import ConfirmationDialog from '../ConfirmationDialog';

describe('ConfirmationDialog', () => {
  it('Should check for component message displayed', () => {
    const mockSuccessCallback = jest.fn();
    render(
      <ChakraProvider value={system}>
        <ConfirmationDialog message={'Confirm'} success={mockSuccessCallback} />
      </ChakraProvider>,
    );
    expect(screen.getByText('Confirm')).toBeInTheDocument();
  });

  it('Should callback with success when confirmed', () => {
    const mockSuccessCallback = jest.fn();
    render(
      <ChakraProvider value={system}>
        <ConfirmationDialog message={'Confirm'} success={mockSuccessCallback} />
      </ChakraProvider>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }));
    expect(mockSuccessCallback).toHaveBeenCalledWith(true);
  });

  it('Should callback with failure when cancelled', () => {
    const mockSuccessCallback = jest.fn();
    render(
      <ChakraProvider value={system}>
        <ConfirmationDialog message={'Confirm'} success={mockSuccessCallback} />
      </ChakraProvider>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(mockSuccessCallback).toHaveBeenCalledWith(false);
  });
});
