import 'jsdom-global/register';
import { Layout } from '../Layout';
import { mount } from 'enzyme';
import { Page } from 'tabler-react';
import { useRouter } from 'next/router';

jest.mock('../../Header/Header', () => {
  const mockComponent = (): React.ReactElement => <div></div>;
  return {
    Header: mockComponent,
  };
});

jest.mock('next/router');

const mockUseRouter = (useRouter as unknown) as jest.Mock<typeof useRouter> &
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
    const wrapper = mount(
      <Layout hideHeader={false}>
        <div>Content</div>
      </Layout>,
    );
    const Content = wrapper.find(Page.Content).first();
    expect(Content.html()).toContain('Content');
  });

  it('Should check for component Login inside layout', () => {
    mockUseRouter.mockImplementation((): any => {
      return {
        push: jest.fn(),
        pathname: '/login',
      };
    });
    const wrapper = mount(
      <Layout hideHeader={false}>
        <div>Login</div>
      </Layout>,
    );
    const Content = wrapper.find(Page.Content).first();
    expect(Content.html()).toContain('Login');
  });
});
