import { Dropdown } from 'tabler-react';
import Link from 'next/link';
import UserContext from '../UserWrapper/UserContext';
import React, { useContext } from 'react';
import { Logo } from './Logo';
import { logout } from '../../accounts/login';
import { useRouter } from 'next/router';
import { Pages } from '../../utils/pages';
import moment from 'moment-timezone';

interface Props {
  hide?: boolean;
}
export const Header: React.FC<Props> = ({ hide }) => {
  const { user, clearContext } = useContext(UserContext);

  const router = useRouter();

  const getItems = (): Record<string, string | boolean | Function>[] => {
    let itemsObject: Record<string, string | boolean | Function>[] = [
      {
        value: 'Sign out',
        onClick: async () => {
          await logout();
          await clearContext();
          router.push(Pages.LOGIN);
        },
        enabled: true,
      },
    ];
    return itemsObject.filter((item) => {
      return item.enabled;
    });
  };

  return (
    <React.Fragment>
      <div className={'site-header sticky-top ' + (hide ? 'hide-header' : '')}>
        <div className="header bg-blue-global p-1">
          <div className="container">
            <div className="d-flex">
              <Link href="/">
                <a className="header-brand d-flex align-items-center">
                  <Logo />
                </a>
              </Link>
              <div className="logo-text d-flex flex-column justify-content-center">
                <h3 className="header-name">
                  {user?.shop?.name || 'Sales Tracker'}
                </h3>
              </div>
              <div className="d-flex flex-row ml-auto">
                <Dropdown
                  isNavLink
                  className="acc-dropdown d-flex"
                  triggerContent={
                    <>
                      {user && (
                        <span className="ml-2 d-none d-sm-block white">
                          <span className="">
                            <b>{user?.fullName}</b>
                          </span>
                          <small className="d-block">{user?.role}</small>
                          <small>
                            <strong className="float-right mb-2">
                              {moment().format('DD/MM/YYYY')}
                            </strong>
                          </small>
                        </span>
                      )}
                    </>
                  }
                  itemsObject={getItems()}
                  position="bottom-start"
                  arrow={true}
                  arrowPosition="left"
                  toggle={false}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      <style jsx global>{`
        .dropdown-item {
          cursor: pointer;
        }
        .header-name {
          color: #ffff;
          margin: 0;
          margin-top: 15px;
        }
        .white {
          color: #ffff;
        }
        .hide-header {
          display: none;
        }
        @media (min-width: 1600px) {
          .header .container {
            max-width: unset;
            padding-left: 25px;
            padding-right: 25px;
          }
        }
      `}</style>
    </React.Fragment>
  );
};
