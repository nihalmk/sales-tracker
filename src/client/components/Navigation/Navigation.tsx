import React, { useContext, useEffect } from 'react';
import { Card } from 'tabler-react';
import UserContext from '../UserWrapper/UserContext';
import { useRouter } from 'next/router';
import { Pages } from '../../utils/pages';

export const NavItems: { [key: string]: string } = {
  SALES: 'sales',
  PURCHASES: 'purchases',
  STOCK: 'stock',
  SALE: 'sale',
  PURCHASE: 'purchase',
  CLOSING: 'closing',
  REPORT: 'report',
};
const Navigation: React.FC<{}> = ({}) => {
  const { setSelectedMenu, enabledNavItems, selectedMenu } = useContext(
    UserContext,
  );

  const router = useRouter();

  useEffect(() => {
    const path = NavItems[router.query.selected as string];
    if (path) {
      setSelectedMenu(path);
    }
  }, [router.query.selected]);

  useEffect(() => {
    if (router.query.selected !== selectedMenu) {
      router.push({
        pathname: Pages.DASHBOARD,
        query: {
          selected: selectedMenu || NavItems.SALES,
        },
      });
    }
  }, [selectedMenu]);
  return (
    <React.Fragment>
      <Card className="hide-in-print mb-0 mt-0 bg-nav">
        <Card.Header>
          <button
            type="button"
            disabled={!enabledNavItems[NavItems.SALES]}
            className={`btn ${
              selectedMenu === NavItems.SALES
                ? 'btn-primary'
                : 'btn-outline-primary'
            }`}
            onClick={() => setSelectedMenu(NavItems.SALES)}
          >
            Sales
          </button>
          <button
            type="button"
            disabled={!enabledNavItems[NavItems.PURCHASES]}
            className={`btn ${
              selectedMenu === NavItems.PURCHASES
                ? 'btn-primary'
                : 'btn-outline-primary'
            } ml-auto`}
            onClick={() => setSelectedMenu(NavItems.PURCHASES)}
          >
            Purchases
          </button>
          <button
            type="button"
            disabled={!enabledNavItems[NavItems.STOCK]}
            className={`btn ${
              selectedMenu === NavItems.STOCK
                ? 'btn-primary'
                : 'btn-outline-primary'
            } ml-auto hide-small-screen`}
            onClick={() => setSelectedMenu(NavItems.STOCK)}
          >
            Stock
          </button>
          <button
            type="button"
            disabled={!enabledNavItems[NavItems.SALE]}
            className={`btn ${
              selectedMenu === NavItems.SALE
                ? 'btn-primary'
                : 'btn-outline-primary'
            } ml-auto hide-small-screen`}
            onClick={() => setSelectedMenu(NavItems.SALE)}
          >
            New Sale
          </button>
          <button
            type="button"
            disabled={!enabledNavItems[NavItems.PURCHASE]}
            className={`btn ${
              selectedMenu === NavItems.PURCHASE
                ? 'btn-primary'
                : 'btn-outline-primary'
            } ml-auto hide-small-screen`}
            onClick={() => setSelectedMenu(NavItems.PURCHASE)}
          >
            New Purchase
          </button>
          <button
            type="button"
            disabled={!enabledNavItems[NavItems.CLOSING]}
            className={`btn ${
              selectedMenu === NavItems.CLOSING
                ? 'btn-primary'
                : 'btn-outline-primary'
            } ml-auto hide-small-screen`}
            onClick={() => setSelectedMenu(NavItems.CLOSING)}
          >
            Closing
          </button>
          <button
            type="button"
            disabled={!enabledNavItems[NavItems.REPORT]}
            className={`btn ${
              selectedMenu === NavItems.REPORT
                ? 'btn-primary'
                : 'btn-outline-primary'
            } ml-auto hide-small-screen`}
            onClick={() => setSelectedMenu(NavItems.REPORT)}
          >
            Report
          </button>
        </Card.Header>
      </Card>
      <style jsx global>{`
        .bg-nav {
          background: #f5f7fb;
        }
      `}</style>
    </React.Fragment>
  );
};

export default Navigation;
