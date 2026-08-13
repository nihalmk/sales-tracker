/**
 * @jest-environment jsdom
 */
import { render } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import { system } from '../../../styles/theme';
import Loader from '../Loader';

describe('Loader', () => {
  it('Should check for component Loader display', () => {
    const { container } = render(
      <ChakraProvider value={system}>
        <Loader />
      </ChakraProvider>,
    );
    const logo = container.querySelector('img');
    expect(logo?.getAttribute('src')).toContain('STLogo.svg');
  });
});
