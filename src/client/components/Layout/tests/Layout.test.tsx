/**
 * @jest-environment jsdom
 */
import { render } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import { system } from '../../../styles/theme';
import { Layout } from '../Layout';
import { useRouter } from 'next/router';

jest.mock('../../Header/Header', () => {
  const mockComponent = (): React.ReactElement => <div></div>;
  return {
    Header: mockComponent,
  };
});

jest.mock('next/router', () => ({
  __esModule: true,
  useRouter: jest.fn(),
}));

const mockUseRouter = useRouter as unknown as jest.Mock<typeof useRouter> &
  typeof useRouter;

describe('Layout', () => {
  beforeAll(() => {
    mockUseRouter.mockImplementation((): any => {
      return {
        push: jest.fn(),
        pathname: '/',
      };
    });
  });
  it('Should check for component Content inside layout', () => {
    const { container } = render(
      <ChakraProvider value={system}>
        <Layout hideHeader={false}>
          <div>Content</div>
        </Layout>
      </ChakraProvider>,
    );
    expect(container.querySelector('.content')?.textContent).toContain(
      'Content',
    );
  });

  it('Should check for component Login inside layout', () => {
    mockUseRouter.mockImplementation((): any => {
      return {
        push: jest.fn(),
        pathname: '/login',
      };
    });
    const { container } = render(
      <ChakraProvider value={system}>
        <Layout hideHeader={false}>
          <div>Login</div>
        </Layout>
      </ChakraProvider>,
    );
    expect(container.querySelector('.content')?.textContent).toContain('Login');
  });
});
