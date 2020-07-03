import React from 'react';
import { Card } from 'tabler-react';

interface Props {
  selected: (selected: string) => void;
}
const Navigation: React.FC<Props> = ({ selected }) => {
  return (
    <React.Fragment>
      <Card className="mb-0 bg-nav">
        <Card.Header>
          <button
            type="button"
            className={'btn btn-primary'}
            onClick={() => selected('sales')}
          >
            Sales
          </button>
          <button
            type="button"
            className={'btn btn-primary ml-auto'}
            onClick={() => selected('purchases')}
          >
            Purchases
          </button>
          <button
            type="button"
            className={'btn btn-primary ml-auto hide-small-screen'}
            onClick={() => selected('stock')}
          >
            Stock
          </button>
          <button
            type="button"
            className={'btn btn-primary ml-auto hide-small-screen'}
            onClick={() => selected('sale')}
          >
            New Sale
          </button>
          <button
            type="button"
            className={'btn btn-primary ml-auto hide-small-screen'}
            onClick={() => selected('purchase')}
          >
            Purchase
          </button>
          <button
            type="button"
            className={'btn btn-primary ml-auto hide-small-screen'}
            onClick={() => selected('closing')}
          >
            Closing
          </button>
          <button
            type="button"
            className={'btn btn-primary ml-auto hide-small-screen'}
            onClick={() => selected('report')}
          >
            Report
          </button>
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
