import 'jsdom-global/register';
import { mount } from 'enzyme';
import { Dropdown } from 'tabler-react';
import { user } from '../../../__stubs__/login.data';
import React from 'react';
import { Header } from '../Header';
import UserContext from '../../UserWrapper/UserContext';
import { act } from 'react-dom/test-utils';
import { logout } from '../../../accounts/login';
import { useRouter } from 'next/router';

const mockUser = user;
const mockClearContext = jest.fn();
const mockRouterPush = jest.fn();

jest.mock('../../../accounts/login');
jest.mock('next/router');

const mockLogout = (logout as unknown) as jest.Mock<typeof logout> &
  typeof logout;
const mockUseRouter = (useRouter as unknown) as jest.Mock<typeof useRouter> &
  typeof useRouter;

let wrapper: any;
describe('Header', () => {
  beforeAll(() => {
    mockClearContext.mockClear();
    mockRouterPush.mockClear();
    mockUseRouter.mockImplementation((): any => {
      return {
        push: mockRouterPush,
      };
    });
    wrapper = mount(
      <UserContext.Provider
        value={{
          user: mockUser,
          loading: false,
          clearContext: mockClearContext,
        }}
      >
        <Header hide={false} />
      </UserContext.Provider>,
    );
  });

  beforeEach(() => {
    mockLogout.mockClear();
    mockUseRouter.mockClear();
    mockRouterPush.mockClear();
    mockClearContext.mockClear();
  });

  it('Should check if user is logged in and user name should be shown', () => {
    const userSection = wrapper.find(Dropdown).first();
    expect(userSection.html()).toContain('John Doe');
  });

  it('Should hide header if hide option true', () => {
    const wrapper = mount(
      <UserContext.Provider
        value={{
          user: mockUser,
          loading: false,
          clearContext: jest.fn(),
        }}
      >
        <Header hide={true} />
      </UserContext.Provider>,
    );
    const hiddenDiv = wrapper.find('.hide-header').first();
    expect(hiddenDiv.length).not.toEqual(0);
  });

  it('Should perform logout operation on sign out click', async () => {
    const dropDownProps = wrapper.find(Dropdown).first().props();
    await act(async () => {
      dropDownProps.itemsObject[0].onClick();
      await Promise.resolve();
    });
    expect(mockLogout).toBeCalled();
    expect(mockClearContext).toBeCalled();
    expect(mockRouterPush).toBeCalled();
  });
});
