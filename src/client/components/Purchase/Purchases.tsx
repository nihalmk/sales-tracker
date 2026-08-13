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
import { Box, Card, Flex, Text, Button, HStack } from '@chakra-ui/react';
import Icon from '../common/Icon';

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

  const [dateFrom, setDateFrom] = useState(pendingDateFrom);
  const [dateTo, setDateTo] = useState(pendingDateTo);
  const [vendorFilter, setVendorFilter] = useState('');
  const [page, setPage] = useState(1);

  const onSearch = () => {
    setDateFrom(pendingDateFrom);
    setDateTo(pendingDateTo);
    setVendorFilter(pendingVendor);
    setPage(1);
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

  // Embedded usage (purchaseFromDate passed in, e.g. from the Closing flow)
  // needs the complete matching set for its callback's ids/total, not one
  // page of it — only the standalone dashboard tab actually paginates.
  const { loading: purchaseLoading, data: purchaseData } = useQuery(
    GET_PURCHASES,
    {
      variables: {
        date: {
          from: dateFrom.clone().startOf('day').toDate(),
          to: dateTo.clone().endOf('day').toDate(),
        },
        vendor: vendorFilter || undefined,
        page: purchaseFromDate ? undefined : page,
        limit: purchaseFromDate ? undefined : PAGE_SIZE,
      },
      fetchPolicy: 'no-cache',
    },
  );

  const purchases: Purchase[] = purchaseData?.getPurchasesForUser?.items || [];
  const totalCount = purchaseData?.getPurchasesForUser?.totalCount || 0;
  const totalAmount = purchaseData?.getPurchasesForUser?.totalAmount || 0;

  useEffect(() => {
    if (purchaseData?.getPurchasesForUser && callback) {
      callback(
        purchases.map((s) => s._id),
        totalAmount,
      );
    }
  }, [purchaseData]);

  const TotalSection = () => {
    return (
      <Box
        ml={hideExtraFields ? 'auto' : undefined}
        textAlign={hideExtraFields ? 'right' : undefined}
      >
        <Text fontSize="sm" color="fg.muted">
          {'Total'}
        </Text>
        <Text color="red.600" fontWeight="medium">
          -{totalAmount}₹
        </Text>
      </Box>
    );
  };

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  return (
    <React.Fragment>
      <Box>
        <Flex align="flex-start" wrap="wrap" gap={4} mb={4}>
          <TotalSection />
          {!purchaseFromDate && (
            <Flex ml="auto" gap={3} wrap="wrap" align="flex-end">
              <Box minW="180px">
                <ContactSelect
                  label="Vendor"
                  placeholder="Filter by vendor"
                  entities={vendorEntities}
                  value={pendingVendor}
                  onSelect={(entity) => setPendingVendor(entity?.name || '')}
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
            {!purchaseFromDate && totalCount > PAGE_SIZE && (
              <HStack className="hide-in-print" justify="center" gap={4} mt={4}>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  Previous
                </Button>
                <Text fontSize="sm" color="fg.muted">
                  Page {page} of {totalPages}
                </Text>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </Button>
              </HStack>
            )}
          </React.Fragment>
        )}
      </Box>
    </React.Fragment>
  );
};

export default Purchases;
