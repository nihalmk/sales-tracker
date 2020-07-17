import React, { useState, useEffect } from 'react';
import { useContext } from 'react';
import UserContext from '../components/UserWrapper/UserContext';
import { NextPage } from 'next';
import { Layout } from '../components/Layout/Layout';
import ErrorMessage from '../components/Errors/ErrorMessage';
import Navigation, { NavItems } from '../components/Navigation/Navigation';
import AddStock from '../components/Stock/AddStock';
import AddSale from '../components/Sale/AddSale';
import Sales from '../components/Sale/Sales';
import Purchases from '../components/Purchase/Purchases';
import AddPurchase from '../components/Purchase/AddPurchase';
import NewClosing from '../components/Closing/NewClosing';
import { GET_PREVIOUS_CLOSING } from '../graphql/query/closing';
import { useQuery } from '@apollo/react-hooks';
import { GET_LAST_SALE } from '../graphql/query/sale';
import { GET_LAST_PURCHASE } from '../graphql/query/purchase';
import moment from 'moment-timezone';
import Loader from '../components/Loaders/Loader';

interface Props {}

const Home: NextPage<Props> = () => {
  const { user } = useContext(UserContext);

  const { data: previousClosing, loading: previousClosingLoading } = useQuery(
    GET_PREVIOUS_CLOSING,
  );

  const { data: lastSale, loading: lastSaleLoading } = useQuery(GET_LAST_SALE);

  const { data: lastPurchase, loading: lastPurchaseLoading } = useQuery(
    GET_LAST_PURCHASE,
  );

  const [selectedMenu, setSelectedMenu] = useState<string>(NavItems.SALE);
  const [needsClosing, setNeedsClosing] = useState(false);
  const [enabledNavItems, setNavItems] = useState({
    sale: true,
    stock: true,
    purchase: true,
    purchases: true,
    sales: true,
    closing: true,
    report: true,
  });

  useEffect(() => {
    if (
      (previousClosing?.getPreviousClosing ||
        previousClosing?.getPreviousClosing === null) &&
      lastSale?.getLastSale &&
      lastPurchase?.getLastPurchase
    ) {
      const closingLastDate = moment(
        previousClosing?.getPreviousClosing?.createdAt,
      );
      const saleLastDate = moment(lastSale?.getLastSale?.createdAt);
      const purchaseLastDate = moment(lastPurchase?.getLastPurchase?.createdAt);
      if (
        (previousClosing?.getPreviousClosing === null &&
          (saleLastDate.isBefore(moment(), 'day') ||
            purchaseLastDate.isBefore(moment(), 'day'))) ||
        (saleLastDate.isBefore(moment(), 'day') &&
          moment(closingLastDate).isBefore(saleLastDate, 'day')) ||
        (purchaseLastDate.isBefore(moment(), 'day') &&
          moment(closingLastDate).isBefore(purchaseLastDate, 'day'))
      ) {
        setNavItems((currentState) => ({
          ...currentState,
          sale: false,
          stock: false,
          purchase: false,
          purchases: false,
          sales: false,
          closing: true,
          report: true,
        }));
        setSelectedMenu(NavItems.CLOSING);
        setNeedsClosing(true);
      }
    }
  }, [previousClosing, lastSale, lastPurchase]);
  const component = () => {
    switch (selectedMenu) {
      case 'stock':
        return <AddStock />;
      case 'sale':
        return <AddSale />;
      case 'sales':
        return <Sales />;
      case 'purchase':
        return <AddPurchase />;
      case 'purchases':
        return <Purchases />;
      case 'closing':
        return (
          <NewClosing
            date={
              needsClosing
                ? moment(
                    lastSale?.getLastSale?.createdAt ||
                      lastPurchase?.getLastPurchase?.createdAt,
                  ).toDate()
                : undefined
            }
          />
        );
      default:
        return <div className="text-center">Not Available</div>;
    }
  };
  const isLoading =
    previousClosingLoading || lastSaleLoading || lastPurchaseLoading;
  return (
    <Layout hideHeader={false}>
      <div className="container">
        {user?.shop ? (
          isLoading ? (
            <React.Fragment>
              <div className="text-center p-5">
                Please wait while we load your shop details..
              </div>
              <Loader />
            </React.Fragment>
          ) : (
            <React.Fragment>
              <Navigation
                selected={setSelectedMenu}
                enabled={enabledNavItems}
              />
              {needsClosing && (
                <small className="btn btn-outline-danger w-100 mt-3">
                  * You need to close your Sales/Purchase for date{' '}
                  <strong>
                    {`(${moment(
                      lastSale?.getLastSale?.createdAt ||
                        lastPurchase?.getLastPurchase?.createdAt,
                    ).format('DD/MM/YYYY')})`}
                  </strong>
                  before adding new Sales
                </small>
              )}
              <div className="mt-5">{component()}</div>
            </React.Fragment>
          )
        ) : (
          <ErrorMessage
            error={`You don't have any shop assigned to you. Please contact your admin and get assigned to a Shop`}
          />
        )}
        <style jsx global>{``}</style>
      </div>
    </Layout>
  );
};

export default Home;
