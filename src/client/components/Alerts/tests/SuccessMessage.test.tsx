/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import { system } from '../../../styles/theme';
import SuccessMessage from '../SuccessMessage';

describe('SuccessMessage', () => {
  it('Should check for component SuccessMessage display', () => {
    render(
      <ChakraProvider value={system}>
        <SuccessMessage message={'Success Message'} />
      </ChakraProvider>,
    );
    expect(screen.getByText('Success Message')).toBeInTheDocument();
  });
});
