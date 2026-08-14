import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import { useQuery } from '@apollo/client';
import { GET_SALES, GET_CUSTOMERS } from '../../graphql/query/sale';
import _ from 'lodash';
import { Sale } from '../../generated/graphql';
import Loader from '../Loaders/Loader';
import moment from 'moment-timezone';
import SaleCard from './Sale';
import DatePicker from '../common/DatePicker/DatePicker';
import ContactSelect from '../common/SelectBoxes/ContactSelect';
import ItemSelect from '../common/SelectBoxes/ItemSelect';
import { currency } from '../../utils/helpers';
import { Box, Card, Flex, Text, Button, VStack } from '@chakra-ui/react';
import Icon from '../common/Icon';
import { useInfiniteScroll } from '../hooks/useInfiniteScroll';
import InfiniteScrollStatus from '../common/InfiniteScrollStatus';
import { useUrlFilters } from '../hooks/useUrlFilters';

const PAGE_SIZE = 10;

interface Props {
  billNumber?: string;
  saleDateFrom?: Date;
  saleDateTo?: Date;
  hideExtraFields?: boolean;
  callback?: (salesIds: string[], total: number) => void;
}

const Sales: NextPage<Props> = function ({
  saleDateFrom,
  saleDateTo,
  hideExtraFields,
  callback,
}) {
  // The date range and customer are only actually applied to the query/list
  // when Search is clicked — these "pending" values just track the controls.
  const [pendingDateFrom, setPendingDateFrom] = useState(
    saleDateFrom ? moment(saleDateFrom) : moment(),
  );
  const [pendingDateTo, setPendingDateTo] = useState(
    saleDateTo ? moment(saleDateTo) : moment(),
  );
  const [pendingCustomer, setPendingCustomer] = useState('');
  const [pendingItemName, setPendingItemName] = useState('');

  const [dateFrom, setDateFrom] = useState(pendingDateFrom);
  const [dateTo, setDateTo] = useState(pendingDateTo);
  const [customerFilter, setCustomerFilter] = useState('');
  const [itemNameFilter, setItemNameFilter] = useState('');

  // Only the standalone dashboard tab (no saleDateFrom prop) owns the URL —
  // embedded usage (Closing flow, AddSale's "Today's Sales" list) must
  // never read from or write to it.
  const isStandalone = !saleDateFrom;
  const {
    params: urlParams,
    isReady: urlReady,
    setParams: setUrlParams,
  } = useUrlFilters();

  useEffect(() => {
    if (!isStandalone || !urlReady) {
      return;
    }
    if (urlParams.salesCustomer) {
      setPendingCustomer(urlParams.salesCustomer);
      setCustomerFilter(urlParams.salesCustomer);
    }
    if (urlParams.salesItem) {
      setPendingItemName(urlParams.salesItem);
      setItemNameFilter(urlParams.salesItem);
    }
    if (urlParams.salesFrom) {
      const from = moment(urlParams.salesFrom);
      setPendingDateFrom(from);
      setDateFrom(from);
    }
    if (urlParams.salesTo) {
      const to = moment(urlParams.salesTo);
      setPendingDateTo(to);
      setDateTo(to);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isStandalone, urlReady]);

  useEffect(() => {
    if (!isStandalone) {
      return;
    }
    setUrlParams({
      salesCustomer: customerFilter || undefined,
      salesItem: itemNameFilter || undefined,
      salesFrom: dateFrom.format('YYYY-MM-DD'),
      salesTo: dateTo.format('YYYY-MM-DD'),
    });
  }, [
    isStandalone,
    customerFilter,
    itemNameFilter,
    dateFrom,
    dateTo,
    setUrlParams,
  ]);

  const onSearch = () => {
    setDateFrom(pendingDateFrom);
    setDateTo(pendingDateTo);
    setCustomerFilter(pendingCustomer);
    setItemNameFilter(pendingItemName);
  };

  const { data: customersData } = useQuery(GET_CUSTOMERS, {
    variables: { includeUnnamed: true },
    fetchPolicy: 'no-cache',
  });
  const customerEntities = (customersData?.getCustomers || []).map(
    (c: { customer: string; contact?: string; email?: string }) => ({
      name: c.customer,
      contact: c.contact,
      email: c.email,
    }),
  );

  const filterVariables = {
    date: {
      from: dateFrom.clone().startOf('day').toDate(),
      to: dateTo.clone().endOf('day').toDate(),
    },
    customer: customerFilter || undefined,
    itemName: itemNameFilter || undefined,
  };

  // Embedded usage (saleDateFrom passed in, e.g. from the Closing flow) needs
  // the complete matching set for its callback's ids/total, not one page of
  // it — only the standalone dashboard tab actually paginates.
  const { loading: embeddedLoading, data: embeddedData } = useQuery(GET_SALES, {
    variables: filterVariables,
    fetchPolicy: 'no-cache',
    skip: !saleDateFrom,
  });

  const {
    items: infiniteSales,
    totalCount: infiniteTotalCount,
    extra: infiniteExtra,
    loading: infiniteLoading,
    loadingMore,
    error: salesError,
    hasMore,
    retry,
    sentinelRef,
  } = useInfiniteScroll({
    query: GET_SALES,
    variables: filterVariables,
    pageSize: PAGE_SIZE,
    getItems: (data): Sale[] => data?.getSalesForUser?.items || [],
    getTotalCount: (data) => data?.getSalesForUser?.totalCount || 0,
    getExtra: (data) => ({
      totalAmount: data?.getSalesForUser?.totalAmount || 0,
      totalProfit: data?.getSalesForUser?.totalProfit || 0,
    }),
    skip: !!saleDateFrom,
  });

  const sales: Sale[] = saleDateFrom
    ? embeddedData?.getSalesForUser?.items || []
    : infiniteSales;
  const totalCount = saleDateFrom
    ? embeddedData?.getSalesForUser?.totalCount || 0
    : infiniteTotalCount;
  const totalAmount = saleDateFrom
    ? embeddedData?.getSalesForUser?.totalAmount || 0
    : infiniteExtra?.totalAmount || 0;
  const totalProfit = saleDateFrom
    ? embeddedData?.getSalesForUser?.totalProfit || 0
    : infiniteExtra?.totalProfit || 0;
  const saleLoading = saleDateFrom ? embeddedLoading : infiniteLoading;

  useEffect(() => {
    if (embeddedData?.getSalesForUser && callback) {
      callback(
        sales.map((s) => s._id),
        totalAmount,
      );
    }
  }, [embeddedData]);

  const TotalSection = () => {
    return (
      <Flex
        ml={hideExtraFields ? 'auto' : undefined}
        textAlign={hideExtraFields ? 'right' : undefined}
      >
        <Text fontSize="sm" color="fg.muted" mr={2}>
          {'Total'}
        </Text>
        <Text
          color={totalProfit > 0 ? 'green.600' : 'red.600'}
          fontWeight="medium"
          fontSize="sm"
          mr={3}
        >
          {totalAmount}
          {currency}
        </Text>
        <Text fontSize="sm" color="fg.muted" mr={2}>
          {'Profile/Loss'}
        </Text>
        <Text
          color={totalProfit > 0 ? 'green.600' : 'red.600'}
          fontWeight="medium"
          fontSize="sm"
        >
          {totalProfit > 0 && '+'}
          {totalProfit}
          {currency}
        </Text>
      </Flex>
    );
  };

  return (
    <React.Fragment>
      <Box>
        <Flex
          className="hide-in-print"
          align="flex-start"
          wrap="wrap"
          gap={4}
          mb={4}
        >
          <TotalSection />
          {!saleDateFrom && (
            <Flex
              className="hide-in-print"
              ml="auto"
              gap={3}
              wrap="wrap"
              align="flex-end"
            >
              <Box w="220px" flexShrink={0}>
                <ContactSelect
                  label="Customer"
                  placeholder="Filter by customer"
                  entities={customerEntities}
                  value={pendingCustomer}
                  onSelect={(entity) => setPendingCustomer(entity?.name || '')}
                />
              </Box>
              <Box w="220px" flexShrink={0}>
                <ItemSelect
                  label="Item"
                  placeholder="Filter by item"
                  value={pendingItemName}
                  onSelect={(name) => setPendingItemName(name || '')}
                />
              </Box>
              <Box minW="150px">
                <DatePicker
                  inputLabel="From"
                  maxDate={pendingDateTo.toDate()}
                  selected={pendingDateFrom.toDate()}
                  onChange={(selectedDate: Date) => {
                    setPendingDateFrom(moment(selectedDate));
                  }}
                ></DatePicker>
              </Box>
              <Box minW="150px">
                <DatePicker
                  inputLabel="To"
                  minDate={pendingDateFrom.toDate()}
                  maxDate={new Date()}
                  selected={pendingDateTo.toDate()}
                  onChange={(selectedDate: Date) => {
                    setPendingDateTo(moment(selectedDate));
                  }}
                ></DatePicker>
              </Box>
              <Button colorPalette="brand" onClick={onSearch}>
                <Icon name="search" light />
                Search
              </Button>
            </Flex>
          )}
        </Flex>
        {!hideExtraFields && (
          <React.Fragment>
            {saleLoading ? (
              <Loader />
            ) : !saleDateFrom && salesError && _.isEmpty(sales) ? (
              <Card.Root variant="outline" textAlign="center" py={10}>
                <VStack gap={3}>
                  <Text color="red.600">Failed to load sales.</Text>
                  <Button
                    size="sm"
                    colorPalette="red"
                    variant="outline"
                    onClick={retry}
                  >
                    Retry
                  </Button>
                </VStack>
              </Card.Root>
            ) : (
              (!_.isEmpty(sales) &&
                sales.map((sale: Sale, i) => {
                  return (
                    <React.Fragment key={i}>
                      <SaleCard
                        saleDetails={sale}
                        showContent={!hideExtraFields}
                      />
                    </React.Fragment>
                  );
                })) || (
                <React.Fragment>
                  <Card.Root variant="outline" textAlign="center" py={10}>
                    <Text color="fg.muted">No sales found</Text>
                  </Card.Root>
                </React.Fragment>
              )
            )}
            {!saleDateFrom && (
              <InfiniteScrollStatus
                loadingMore={loadingMore}
                error={!_.isEmpty(sales) && salesError}
                hasMore={hasMore}
                itemsCount={sales.length}
                totalCount={totalCount}
                onRetry={retry}
                sentinelRef={sentinelRef}
                itemLabel="sales"
              />
            )}
          </React.Fragment>
        )}
      </Box>
    </React.Fragment>
  );
};

export default Sales;
