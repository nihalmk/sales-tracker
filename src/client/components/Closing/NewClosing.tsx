import React, {
  useState,
  useEffect,
  useContext,
  // useContext
} from 'react';
import { NextPage } from 'next';
import { useMutation, useQuery } from '@apollo/client';
import SuccessMessage from '../Alerts/SuccessMessage';
import ErrorMessage from '../Errors/ErrorMessage';
import _ from 'lodash';
import { CreateClosingInput, Closing } from '../../generated/graphql';
import Link from 'next/link';
import { CREATE_CLOSING } from '../../graphql/mutation/closing';
import moment from 'moment-timezone';
import Sales from '../Sale/Sales';
import Purchases from '../Purchase/Purchases';
import { Spent } from './Spent';
import { Received } from './Received';
import {
  GET_PREVIOUS_CLOSING,
  GET_CLOSINGS,
} from '../../graphql/query/closing';
import Loader from '../Loaders/Loader';
import { currency, omitTypenameKey } from '../../utils/helpers';
import ConfirmationDialog from '../Alerts/ConfirmationDialog';
import OverLay from '../OverLay';
import { NavItems } from '../Navigation/Navigation';
import UserContext from '../UserWrapper/UserContext';
import Print from '../common/Print';
// import UserContext from '../UserWrapper/UserContext';
import { Box, Card, Heading, Text, Button, HStack } from '@chakra-ui/react';
import Icon from '../common/Icon';

interface Props {
  closingId?: string;
  startDate?: Date;
  endDate?: Date;
  isView?: boolean;
}

const NewClosing: NextPage<Props> = function ({ startDate, endDate, isView }) {
  const { setSelectedMenu, setNavItems } = useContext(UserContext);

  const [submitCreateClosing, { loading: createLoading }] =
    useMutation(CREATE_CLOSING);

  const { data: previousClosing, loading: previousClosingLoading } = useQuery(
    GET_PREVIOUS_CLOSING,
    {
      fetchPolicy: 'no-cache',
      skip: isView,
    },
  );

  const { data: closings, loading: closingsLoading } = useQuery(GET_CLOSINGS, {
    variables: {
      date: {
        from: moment(startDate).startOf('day').toDate(),
        to: moment(endDate || startDate)
          .endOf('day')
          .toDate(),
      },
    },
    fetchPolicy: 'no-cache',
  });

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [, setSubmitted] = useState(false);
  const [salesTotal, setSalesTotal] = useState(0);
  const [purchaseTotal, setPurchaseTotal] = useState(0);
  const [today, setToday] = useState(startDate ? moment(startDate) : moment());
  const [newClosing, setNewClosing] = useState<CreateClosingInput>();
  const [allClosings, setAllClosings] = useState<CreateClosingInput[]>();
  const [prevClosing, setPrevClosing] = useState<Closing>();
  const [spentTotal, setSpentTotal] = useState(0);
  const [receivedTotal, setReceivedTotal] = useState(0);
  const [closingConfirmation, setClosingConfirmation] = useState(false);
  const [spentView, setSpentView] = useState(!isView);
  const [receivedView, setRecievedView] = useState(!isView);
  const [purchasesView, setPurchasesView] = useState(false);
  const [salesView, setSalesView] = useState(false);

  useEffect(() => {
    if (closings?.getClosingForUser) {
      setNewClosing(closings.getClosingForUser[0]);
      setAllClosings(closings.getClosingForUser);
      setReceivedTotal(
        _.sum(
          _.flatMap(
            (closings.getClosingForUser as CreateClosingInput[])?.map((c) =>
              c.receivedItems.map((s) => s.amount),
            ),
          ),
        ),
      );
      setSpentTotal(
        _.sum(
          _.flatMap(
            (closings.getClosingForUser as CreateClosingInput[])?.map((c) =>
              c.spentItems.map((s) => s.amount),
            ),
          ),
        ),
      );
    }
  }, [closings]);

  useEffect(() => {
    setToday(moment(startDate));
  }, [startDate]);

  useEffect(() => {
    if (previousClosing?.getPreviousClosing) {
      setPrevClosing(previousClosing.getPreviousClosing);
    }
  }, [previousClosing]);

  const onNewClosingCreate = async (e?: React.SyntheticEvent) => {
    e && e.preventDefault();
    const {
      salesIds,
      spentItems,
      receivedItems,
      spentTotal,
      inHandTotal,
      purchaseIds,
    } = newClosing || {};
    setSubmitted(true);
    try {
      await submitCreateClosing({
        variables: {
          purchaseIds,
          salesIds,
          spentItems: spentItems && omitTypenameKey(spentItems),
          receivedItems: receivedItems && omitTypenameKey(receivedItems),
          spentTotal,
          inHandTotal,
          active: true,
          date: today.endOf('day').toDate(),
        },
      });
      setMessage('New closing added successfully');
      setNewClosing(undefined);
      setSubmitted(false);
      setSelectedMenu(NavItems.REPORT);
      setNavItems({
        sale: false,
        stock: true,
        purchase: false,
        purchases: true,
        sales: true,
        closing: false,
        report: true,
      });
      setTimeout(() => {
        setMessage('');
      }, 5000);
    } catch (e) {
      setError(`Error adding new closing. ${e.message}`);
      setTimeout(() => {
        setError('');
      }, 5000);
    }
  };

  const getTotal = () => {
    const receivedItemsTotal = _.sum(
      newClosing?.receivedItems?.map((s) => s.amount),
    );
    const spentTotal = _.sum(newClosing?.spentItems?.map((s) => s.amount));
    const inHandTotal =
      (prevClosing?.inHandTotal || 0) +
      salesTotal +
      receivedItemsTotal -
      (purchaseTotal + spentTotal);

    return [inHandTotal, spentTotal];
  };

  if (previousClosingLoading || closingsLoading) {
    return (
      <React.Fragment>
        <Text textAlign="center" py={4} color="fg.muted">
          Getting closing data...
        </Text>
        <Loader />
      </React.Fragment>
    );
  }
  if (isView && !newClosing) {
    return (
      <React.Fragment>
        <Card.Root variant="outline">
          <Text textAlign="center" py={4}>
            No closing found
          </Text>
        </Card.Root>
      </React.Fragment>
    );
  }

  const getNetTotal = () => {
    return (
      prevClosing.inHandTotal +
      salesTotal +
      receivedTotal -
      purchaseTotal -
      spentTotal
    );
  };

  // const inHandTotalAtLastDate = () => {
  //   const lastClosing = allClosings.sort((closing) => closing.date);
  //   return lastClosing[lastClosing.length - 1];
  // };

  return (
    <React.Fragment>
      <Card.Root variant="elevated" borderRadius="l3" mb={5}>
        <Card.Header>
          <HStack justify="space-between" wrap="wrap">
            <HStack gap={2}>
              <Icon name={isView ? 'report' : 'closing'} boxSize={5} />
              <Heading size="md">
                {isView ? 'Report | ' : 'New Closing | '}
                {today.format('DD/MM/YYYY')}{' '}
                {endDate && `- ${moment(endDate).format('DD/MM/YYYY')}`}
              </Heading>
            </HStack>
            {!isView && (
              <Text>
                Previous (
                {moment(
                  prevClosing?.date || moment(today).subtract(1, 'days'),
                ).format('DD/MM/YYYY')}
                ):{' '}
                <Text as="span" color="green.600" fontWeight="medium">
                  {prevClosing?.inHandTotal || 0}
                  {currency}
                </Text>
              </Text>
            )}
          </HStack>
        </Card.Header>
        <SuccessMessage message={message} />
        <ErrorMessage error={error} />
        <Card.Body pb={0}>
          {!isView && !prevClosing?.inHandTotal && (
            <Text
              className="hide-in-print"
              color="red.600"
              borderWidth="1px"
              borderColor="red.300"
              borderRadius="l2"
              px={3}
              py={2}
              mb={3}
            >
              * Add Total in hand on <strong>Received</strong> section for first
              time closing
            </Text>
          )}
          <HStack gap={2} mb={2}>
            <Icon name="sales" boxSize={4} />
            <Heading size="sm">Sales</Heading>
          </HStack>
          <Button
            className="hide-in-print"
            colorPalette="brand"
            size="sm"
            w="full"
            mb={3}
            onClick={() => {
              setSalesView(!salesView);
            }}
          >
            {(salesView ? 'Hide' : 'View') + ' Sales'}
          </Button>
          <Box mb={4}>
            <Sales
              hideExtraFields={!salesView}
              saleDateFrom={today.toDate()}
              saleDateTo={endDate}
              callback={(salesIds, total) => {
                !isView &&
                  setNewClosing((currentState) => ({
                    ...currentState,
                    salesIds,
                  }));
                setSalesTotal(total);
              }}
            />
          </Box>
          <HStack gap={2} mb={2}>
            <Icon name="purchases" boxSize={4} />
            <Heading size="sm">Purchases</Heading>
          </HStack>
          <Button
            className="hide-in-print"
            colorPalette="brand"
            size="sm"
            w="full"
            mb={3}
            onClick={() => {
              setPurchasesView(!purchasesView);
            }}
          >
            {(purchasesView ? 'Hide' : 'View') + ' Purchases'}
          </Button>
          <Box mb={4}>
            <Purchases
              hideExtraFields={!purchasesView}
              purchaseFromDate={today.toDate()}
              purchaseToDate={endDate}
              callback={(_purchaseIds, total) => {
                !isView &&
                  setNewClosing((currentState) => ({
                    ...currentState,
                    purchaseIds: _purchaseIds,
                  }));
                setPurchaseTotal(total);
              }}
            />
          </Box>
          <HStack gap={2} mb={2}>
            <Icon name="expenses" boxSize={4} />
            <Heading size="sm">Expenses</Heading>
          </HStack>
          <Text fontSize="sm" color="fg.muted" mb={2}>
            * Include borrowed money to deduct money received from sales
          </Text>
          <Card.Root variant="outline" p={0} mb={4} id={newClosing?.date}>
            <HStack justify="flex-end" p={2}>
              <Text color="red.600" fontWeight="medium">
                {spentTotal}
                {currency}
              </Text>
            </HStack>
            <Box px={2} pb={2}>
              <Button
                className="hide-in-print"
                colorPalette="brand"
                size="sm"
                onClick={() => {
                  setSpentView(!spentView);
                }}
              >
                {(spentView ? 'Hide' : 'View') + ' Spent Items'}
              </Button>
            </Box>
            {spentView && (
              <Spent
                callback={(spentItems) => {
                  !isView &&
                    setSpentTotal(_.sum(spentItems.map((s) => s.amount)));
                  !isView &&
                    setNewClosing((currentState) => ({
                      ...currentState,
                      spentItems,
                    }));
                }}
                isView={isView}
                spentItemsList={_.flatMap(
                  allClosings?.map((c) => c.spentItems),
                )}
                id={newClosing?.date}
              />
            )}
          </Card.Root>
          <HStack gap={2} mb={2}>
            <Icon name="received" boxSize={4} />
            <Heading size="sm">Received</Heading>
          </HStack>
          <Card.Root variant="outline" p={0} mb={4} id={newClosing?.date}>
            <HStack justify="flex-end" p={2}>
              <Text color="green.600" fontWeight="medium">
                {receivedTotal}
                {currency}
              </Text>
            </HStack>
            <Box px={2} pb={2}>
              <Button
                className="hide-in-print"
                colorPalette="brand"
                size="sm"
                onClick={() => {
                  setRecievedView(!receivedView);
                }}
              >
                {(receivedView ? 'Hide' : 'View') + ' Received Items'}
              </Button>
            </Box>
            {receivedView && (
              <Received
                callback={(receivedItems) => {
                  !isView &&
                    setReceivedTotal(_.sum(receivedItems.map((s) => s.amount)));

                  !isView &&
                    setNewClosing((currentState) => ({
                      ...currentState,
                      receivedItems,
                    }));
                }}
                isView={isView}
                receivedItemsList={_.flatMap(
                  allClosings?.map((c) => c.receivedItems),
                )}
                id={newClosing?.date}
              />
            )}
          </Card.Root>
          {!isView && (
            <Card.Root variant="outline" mb={4} p={3}>
              <HStack justify="space-between">
                <Text fontSize="lg" fontWeight="bold">
                  {isView
                    ? 'Net Balance (Sales Total + Received Total - Purchases Total - Expenses Total)'
                    : 'Closing Balance'}
                </Text>
                <Text fontSize="lg" fontWeight="bold" color="green.600">
                  {isView ? getNetTotal() || 0 : getTotal()[0].toFixed(2)}
                  {currency}
                </Text>
              </HStack>
            </Card.Root>
          )}
        </Card.Body>
        <Card.Footer>
          <HStack w="full">
            <Button
              asChild
              className="hide-in-print"
              variant="outline"
              colorPalette="red"
            >
              <Link href="/dashboard">
                <Icon name="cancel" />
                Cancel
              </Link>
            </Button>
            <Box ml="auto">
              <Print setPrintStatus={() => {}} />
            </Box>
            <Button
              className="hide-in-print"
              colorPalette="brand"
              loading={createLoading}
              disabled={isView}
              onClick={() => {
                !isView && setClosingConfirmation(true);
              }}
            >
              <Icon name="done" light />
              Submit
            </Button>
          </HStack>
        </Card.Footer>
      </Card.Root>
      <OverLay show={!!closingConfirmation}>
        <ConfirmationDialog
          success={(success) => {
            if (success) {
              onNewClosingCreate();
            }
            setClosingConfirmation(false);
          }}
          message={`You won't be able to make changes after you submit. ${
            !startDate
              ? 'Please continue if you are closing for the day!'
              : 'Please confirm and continue!'
          }`}
        />
      </OverLay>
    </React.Fragment>
  );
};

export default NewClosing;
