import React from 'react';
import { Card } from 'tabler-react';

interface Props {
  selected: (selected: string) => void;
  enabled: { [key: string]: boolean}
}

export const NavItems = {
  SALES: 'sales',
  PURCHASES: 'purchases',
  STOCK: 'stock',
  SALE: 'sale',
  PURCHASE: 'purchase',
  CLOSING: 'closing',
}
const Navigation: React.FC<Props> = ({ selected, enabled }) => {
  return (
    <React.Fragment>
      <Card className="mb-0 mt-0 bg-nav">
        <Card.Header>
          <button
            type="button"
            disabled={!enabled[NavItems.SALES]}
            className={'btn btn-primary'}
            onClick={() => selected(NavItems.SALES)}
          >
            Sales
          </button>
          <button
            type="button"
            disabled={!enabled[NavItems.PURCHASES]}
            className={'btn btn-primary ml-auto'}
            onClick={() => selected(NavItems.PURCHASES)}
          >
            Purchases
          </button>
          <button
            type="button"
            disabled={!enabled[NavItems.STOCK]}
            className={'btn btn-primary ml-auto hide-small-screen'}
            onClick={() => selected(NavItems.STOCK)}
          >
            Stock
          </button>
          <button
            type="button"
            disabled={!enabled[NavItems.SALE]}
            className={'btn btn-primary ml-auto hide-small-screen'}
            onClick={() => selected(NavItems.SALE)}
          >
            New Sale
          </button>
          <button
            type="button"
            disabled={!enabled[NavItems.PURCHASE]}
            className={'btn btn-primary ml-auto hide-small-screen'}
            onClick={() => selected(NavItems.PURCHASE)}
          >
            New Purchase
          </button>
          <button
            type="button"
            disabled={!enabled[NavItems.CLOSING]}
            className={'btn btn-primary ml-auto hide-small-screen'}
            onClick={() => selected(NavItems.CLOSING)}
          >
            Closing
          </button>
          {/* <button
            type="button"
            disabled={!enabled[NavItems.REPORT]}
            className={'btn btn-primary ml-auto hide-small-screen'}
            onClick={() => selected(NavItems.REPORT)}
          >
            Report
          </button> */}
        </Card.Header>
      </Card>
      <style jsx global>{`
        .bg-nav {
          background: #e2e2ff;
        }
      `}</style>
    </React.Fragment>
  );
};

export default Navigation;
