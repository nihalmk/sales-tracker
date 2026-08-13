/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import { system } from '../../../styles/theme';
import ErrorMessage from '../ErrorMessage';

describe('ErrorMessage', () => {
  it('Should check for component ErrorMessage display', () => {
    render(
      <ChakraProvider value={system}>
        <ErrorMessage error={'Error Message'} />
      </ChakraProvider>,
    );
    expect(screen.getByText('Error Message')).toBeInTheDocument();
  });
});
