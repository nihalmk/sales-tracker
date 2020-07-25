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
import Report from '../components/Report/Report';
import _ from 'lodash';
import Link from 'next/link';
import { Pages } from '../utils/pages';

interface Props {}

const Home: NextPage<Props> = () => {
  const { user, setNavItems, setSelectedMenu, selectedMenu } = useContext(
    UserContext,
  );

  const {
    data: previousClosing,
    loading: previousClosingLoading,
    refetch: refetchPrevClosing,
  } = useQuery(GET_PREVIOUS_CLOSING, {
    fetchPolicy: 'no-cache',
  });

  const {
    data: lastSale,
    loading: lastSaleLoading,
    refetch: refetchLastSale,
  } = useQuery(GET_LAST_SALE, {
    fetchPolicy: 'no-cache',
  });

  const {
    data: lastPurchase,
    loading: lastPurchaseLoading,
    refetch: refetchLastPurchase,
  } = useQuery(GET_LAST_PURCHASE, {
    fetchPolicy: 'no-cache',
  });

  // refetch on changes in menu selected. hack to refetch on closing submit.
  useEffect(() => {
    refetchPrevClosing();
    refetchLastPurchase();
    refetchLastSale();
  }, [selectedMenu]);

  const [needsClosing, setNeedsClosing] = useState(false);

  useEffect(() => {
    // Closed for today
    const proceedSale = () => {
      setNavItems({
        sale: true,
        stock: true,
        purchase: true,
        purchases: true,
        sales: true,
        closing: true,
        report: true,
      });
      setSelectedMenu(NavItems.SALE);
      setNeedsClosing(false);
    };
    if (
      !_.isEmpty(previousClosing?.getPreviousClosing) &&
      moment(previousClosing?.getPreviousClosing?.date).isSame(moment(), 'day')
    ) {
      setNavItems({
        sale: false,
        stock: true,
        purchase: false,
        purchases: true,
        sales: true,
        closing: false,
        report: true,
      });
      setSelectedMenu(NavItems.SALES);
      return;
    } else {
      proceedSale();
    }
    const closingLastDate = moment(previousClosing?.getPreviousClosing?.date);
    const saleLastDate = moment(lastSale?.getLastSale?.createdAt);
    const purchaseLastDate = moment(lastPurchase?.getLastPurchase?.createdAt);

    const needClosing = () => {
      setNavItems({
        sale: false,
        stock: false,
        purchase: false,
        purchases: false,
        sales: false,
        closing: true,
        report: true,
      });
      setSelectedMenu(NavItems.CLOSING);
      setNeedsClosing(true);
    };

    const checkForClosing = (noClosing?: boolean) => {
      if (
        lastSale?.getLastSale &&
        ((closingLastDate.isBefore(saleLastDate, 'day') &&
          saleLastDate.isBefore(moment(), 'day')) ||
          (noClosing && saleLastDate.isBefore(moment(), 'day')))
      ) {
        needClosing();
        return;
      }
      if (
        lastPurchase?.getLastPurchase &&
        ((closingLastDate.isBefore(purchaseLastDate, 'day') &&
          purchaseLastDate.isBefore(moment(), 'day')) ||
          (noClosing && saleLastDate.isBefore(moment(), 'day')))
      ) {
        needClosing();
        return;
      }
      setNeedsClosing(false);
    };
    // Did not close previous sale
    if (previousClosing?.getPreviousClosing === null) {
      checkForClosing(true);
    } else if (
      previousClosing?.getPreviousClosing &&
      moment(closingLastDate).isBefore(moment().subtract(1, 'days'), 'day')
    ) {
      checkForClosing();
    } else {
      proceedSale();
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
      case 'report':
        return <Report />;
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
              <Navigation />
              {previousClosing?.getPreviousClosing !== null &&
                moment(previousClosing?.getPreviousClosing?.date).isSame(
                  moment(),
                  'day',
                ) && (
                  <small className="btn btn-outline-danger w-100 mt-3">
                    * You are closed for the day and the closing details are
                    available on date:{' '}
                    {moment(previousClosing?.getPreviousClosing?.date).format(
                      'DD/MM/YYYY',
                    )}{' '}
                    on Report
                  </small>
                )}
              {needsClosing && (
                <small className="btn btn-outline-danger w-100 mt-3">
                  * You need to close your Sales/Purchase for date{' '}
                  <strong>
                    {`(${moment(
                      lastSale?.getLastSale?.createdAt ||
                        lastPurchase?.getLastPurchase?.createdAt,
                    ).format('DD/MM/YYYY')})`}
                  </strong>{' '}
                  before adding new Sales
                </small>
              )}
              <div className="mt-5">{component()}</div>
            </React.Fragment>
          )
        ) : (
          <div className="p-5">
            <ErrorMessage
              error={`You don't have any shop assigned to you. Please contact your admin and get assigned to a Shop`}
            />
            <Link href={Pages.INDEX}>
            <button className="btn btn-primary">Create your own shop</button>
            </Link>
          </div>
        )}
        <style jsx global>{`
          .page-content {
            margin-top: 0;
          }
        `}</style>
      </div>
    </Layout>
  );
};

export default Home;
