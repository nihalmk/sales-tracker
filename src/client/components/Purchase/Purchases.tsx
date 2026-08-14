import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import { useQuery } from '@apollo/client';
import { GET_PURCHASES, GET_VENDORS } from '../../graphql/query/purchase';
import _ from 'lodash';
import { Purchase } from '../../generated/graphql';
import Loader from '../Loaders/Loader';
import moment from 'moment-timezone';
import PurchaseCard from './Purchase';
import DatePicker from '../common/DatePicker/DatePicker';
import ContactSelect from '../common/SelectBoxes/ContactSelect';
import ItemSelect from '../common/SelectBoxes/ItemSelect';
import { Box, Card, Flex, Text, Button, VStack } from '@chakra-ui/react';
import Icon from '../common/Icon';
import { useInfiniteScroll } from '../hooks/useInfiniteScroll';
import InfiniteScrollStatus from '../common/InfiniteScrollStatus';
import { useUrlFilters } from '../hooks/useUrlFilters';

const PAGE_SIZE = 10;

interface Props {
  billNumber?: string;
  hideExtraFields?: boolean;
  purchaseFromDate?: Date;
  purchaseToDate?: Date;
  callback?: (purchaseIds: string[], total: number) => void;
}

const Purchases: NextPage<Props> = function ({
  hideExtraFields,
  purchaseFromDate,
  purchaseToDate,
  callback,
}) {
  // The date range and vendor are only actually applied to the query/list
  // when Search is clicked — these "pending" values just track the controls.
  const [pendingDateFrom, setPendingDateFrom] = useState(
    purchaseFromDate ? moment(purchaseFromDate) : moment(),
  );
  const [pendingDateTo, setPendingDateTo] = useState(
    purchaseToDate ? moment(purchaseToDate) : moment(),
  );
  const [pendingVendor, setPendingVendor] = useState('');
  const [pendingItemName, setPendingItemName] = useState('');

  const [dateFrom, setDateFrom] = useState(pendingDateFrom);
  const [dateTo, setDateTo] = useState(pendingDateTo);
  const [vendorFilter, setVendorFilter] = useState('');
  const [itemNameFilter, setItemNameFilter] = useState('');

  // Only the standalone dashboard tab (no purchaseFromDate prop) owns the
  // URL — embedded usage (Closing flow) must never read from or write to
  // it.
  const isStandalone = !purchaseFromDate;
  const { params: urlParams, isReady: urlReady, setParams: setUrlParams } =
    useUrlFilters();

  useEffect(() => {
    if (!isStandalone || !urlReady) {
      return;
    }
    if (urlParams.purchaseVendor) {
      setPendingVendor(urlParams.purchaseVendor);
      setVendorFilter(urlParams.purchaseVendor);
    }
    if (urlParams.purchaseItem) {
      setPendingItemName(urlParams.purchaseItem);
      setItemNameFilter(urlParams.purchaseItem);
    }
    if (urlParams.purchaseFrom) {
      const from = moment(urlParams.purchaseFrom);
      setPendingDateFrom(from);
      setDateFrom(from);
    }
    if (urlParams.purchaseTo) {
      const to = moment(urlParams.purchaseTo);
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
      purchaseVendor: vendorFilter || undefined,
      purchaseItem: itemNameFilter || undefined,
      purchaseFrom: dateFrom.format('YYYY-MM-DD'),
      purchaseTo: dateTo.format('YYYY-MM-DD'),
    });
  }, [isStandalone, vendorFilter, itemNameFilter, dateFrom, dateTo, setUrlParams]);

  const onSearch = () => {
    setDateFrom(pendingDateFrom);
    setDateTo(pendingDateTo);
    setVendorFilter(pendingVendor);
    setItemNameFilter(pendingItemName);
  };

  const { data: vendorsData } = useQuery(GET_VENDORS, {
    variables: { includeUnnamed: true },
    fetchPolicy: 'no-cache',
  });
  const vendorEntities = (vendorsData?.getVendors || []).map(
    (v: { vendor: string; contact?: string; email?: string }) => ({
      name: v.vendor,
      contact: v.contact,
      email: v.email,
    }),
  );

  const filterVariables = {
    date: {
      from: dateFrom.clone().startOf('day').toDate(),
      to: dateTo.clone().endOf('day').toDate(),
    },
    vendor: vendorFilter || undefined,
    itemName: itemNameFilter || undefined,
  };

  // Embedded usage (purchaseFromDate passed in, e.g. from the Closing flow)
  // needs the complete matching set for its callback's ids/total, not one
  // page of it — only the standalone dashboard tab actually paginates.
  const { loading: embeddedLoading, data: embeddedData } = useQuery(
    GET_PURCHASES,
    {
      variables: filterVariables,
      fetchPolicy: 'no-cache',
      skip: !purchaseFromDate,
    },
  );

  const {
    items: infinitePurchases,
    totalCount: infiniteTotalCount,
    extra: infiniteTotalAmount,
    loading: infiniteLoading,
    loadingMore,
    error: purchasesError,
    hasMore,
    retry,
    sentinelRef,
  } = useInfiniteScroll({
    query: GET_PURCHASES,
    variables: filterVariables,
    pageSize: PAGE_SIZE,
    getItems: (data): Purchase[] => data?.getPurchasesForUser?.items || [],
    getTotalCount: (data) => data?.getPurchasesForUser?.totalCount || 0,
    getExtra: (data) => data?.getPurchasesForUser?.totalAmount || 0,
    skip: !!purchaseFromDate,
  });

  const purchases: Purchase[] = purchaseFromDate
    ? embeddedData?.getPurchasesForUser?.items || []
    : infinitePurchases;
  const totalCount = purchaseFromDate
    ? embeddedData?.getPurchasesForUser?.totalCount || 0
    : infiniteTotalCount;
  const totalAmount = purchaseFromDate
    ? embeddedData?.getPurchasesForUser?.totalAmount || 0
    : infiniteTotalAmount || 0;
  const purchaseLoading = purchaseFromDate ? embeddedLoading : infiniteLoading;

  useEffect(() => {
    if (embeddedData?.getPurchasesForUser && callback) {
      callback(
        purchases.map((s) => s._id),
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
        <Text color="red.600" fontWeight="medium" fontSize={'sm'}>
          -{totalAmount}₹
        </Text>
      </Flex>
    );
  };

  return (
    <React.Fragment>
      <Box>
        <Flex align="flex-start" wrap="wrap" gap={4} mb={4}>
          <TotalSection />
          {!purchaseFromDate && (
            <Flex ml="auto" gap={3} wrap="wrap" align="flex-end">
              <Box w="220px" flexShrink={0}>
                <ContactSelect
                  label="Vendor"
                  placeholder="Filter by vendor"
                  entities={vendorEntities}
                  value={pendingVendor}
                  onSelect={(entity) => setPendingVendor(entity?.name || '')}
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
            {purchaseLoading ? (
              <Loader />
            ) : !purchaseFromDate && purchasesError && _.isEmpty(purchases) ? (
              <Card.Root variant="outline" textAlign="center" py={10}>
                <VStack gap={3}>
                  <Text color="red.600">Failed to load purchases.</Text>
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
              (!_.isEmpty(purchases) &&
                purchases.map((purchase: Purchase, i) => {
                  return (
                    <React.Fragment key={i}>
                      <PurchaseCard
                        purchaseDetails={purchase}
                        showContent={!hideExtraFields}
                      />
                    </React.Fragment>
                  );
                })) || (
                <React.Fragment>
                  <Card.Root variant="outline" textAlign="center" py={10}>
                    <Text color="fg.muted">No purchases found</Text>
                  </Card.Root>
                </React.Fragment>
              )
            )}
            {!purchaseFromDate && (
              <InfiniteScrollStatus
                loadingMore={loadingMore}
                error={!_.isEmpty(purchases) && purchasesError}
                hasMore={hasMore}
                itemsCount={purchases.length}
                totalCount={totalCount}
                onRetry={retry}
                sentinelRef={sentinelRef}
                itemLabel="purchases"
              />
            )}
          </React.Fragment>
        )}
      </Box>
    </React.Fragment>
  );
};

export default Purchases;
