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
import { useQuery } from '@apollo/client';
import { GET_LAST_SALE } from '../graphql/query/sale';
import { GET_LAST_PURCHASE } from '../graphql/query/purchase';
import moment from 'moment-timezone';
import Loader from '../components/Loaders/Loader';
import Report from '../components/Report/Report';
import _ from 'lodash';
import Link from 'next/link';
import { Pages } from '../utils/pages';
import OverLay from '../components/OverLay';
import ConfirmationDialog from '../components/Alerts/ConfirmationDialog';
import { useRouter } from 'next/router';
import { Box, Heading, Text, Button, Alert } from '@chakra-ui/react';

interface Props {}

const Home: NextPage<Props> = () => {
  const {
    user,
    setNavItems,
    setSelectedMenu,
    selectedMenu,
    isPaid,
  } = useContext(UserContext);

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
  const [expiredPopup, setExpiredPopup] = useState('');

  const router = useRouter();

  useEffect(() => {
    // Closed for today
    if (isPaid) {
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
        moment(previousClosing?.getPreviousClosing?.date).isSame(
          moment(),
          'day',
        )
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
            startDate={
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
        return <Text textAlign="center">Not Available</Text>;
    }
  };
  const isLoading =
    previousClosingLoading || lastSaleLoading || lastPurchaseLoading;

  return (
    <Layout hideHeader={false}>
      <Box display="none" className="show-in-print">
        <Heading size="md">{user?.shop.name}</Heading>
        <Text fontSize="lg">
          {user?.shop.address?.street} {user?.shop.address?.pincode}
        </Text>
        <Text fontSize="lg">{user?.shop.type}</Text>
        <Text>{user?.phone}</Text>
      </Box>
      {user?.shop ? (
        isLoading ? (
          <React.Fragment>
            <Text textAlign="center" py={5} color="fg.muted">
              Please wait while we load your shop details..
            </Text>
            <Loader />
          </React.Fragment>
        ) : (
          <React.Fragment>
            <Navigation />
            {!isPaid && (
              <Button
                asChild
                colorPalette="orange"
                w="full"
                mt={3}
                h="auto"
                py={3}
                whiteSpace="normal"
              >
                <Link href={Pages.ACCOUNTS}>
                  Your trial period for 7 days has expired. Please purchase a
                  paid account to proceed further with the sales. You will no
                  longer be able to see or add any sales or purchase data
                </Link>
              </Button>
            )}
            {isPaid &&
              previousClosing?.getPreviousClosing !== null &&
              moment(previousClosing?.getPreviousClosing?.date).isSame(
                moment(),
                'day',
              ) && (
                <Alert.Root status="warning" borderRadius="l2" mt={3}>
                  <Alert.Indicator />
                  <Alert.Content>
                    <Alert.Description>
                      You are closed for the day and the closing details are
                      available on date:{' '}
                      {moment(
                        previousClosing?.getPreviousClosing?.date,
                      ).format('DD/MM/YYYY')}{' '}
                      on Report
                    </Alert.Description>
                  </Alert.Content>
                </Alert.Root>
              )}
            {needsClosing && (
              <Alert.Root status="error" borderRadius="l2" mt={3}>
                <Alert.Indicator />
                <Alert.Content>
                  <Alert.Description>
                    You need to close your Sales/Purchase for date{' '}
                    <Text as="span" fontWeight="bold">
                      {`(${moment(
                        lastSale?.getLastSale?.createdAt ||
                          lastPurchase?.getLastPurchase?.createdAt,
                      ).format('DD/MM/YYYY')})`}
                    </Text>{' '}
                    before adding new Sales
                  </Alert.Description>
                </Alert.Content>
              </Alert.Root>
            )}
            <Box mt={5}>{component()}</Box>
          </React.Fragment>
        )
      ) : (
        <Box py={5}>
          <ErrorMessage
            error={`You don't have any shop assigned to you. Please contact your admin and get assigned to a Shop`}
          />
          <Button asChild colorPalette="brand" mt={3}>
            <Link href={Pages.INDEX}>Create your own shop</Link>
          </Button>
        </Box>
      )}
      <OverLay show={expiredPopup !== 'cancelled' && !isPaid}>
        <ConfirmationDialog
          headerMessage={'Trial Expired!'}
          success={(success) => {
            if (success) {
              router.push(Pages.ACCOUNTS);
            } else {
              setExpiredPopup('cancelled');
            }
          }}
          message="Your trial period for 7 days has expired. Please purchase a paid account to proceed further with the sales"
        />
      </OverLay>
    </Layout>
  );
};

export default Home;
