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
import { currency } from '../../utils/helpers';
import { Box, Card, Flex, Text, Button, HStack } from '@chakra-ui/react';
import Icon from '../common/Icon';

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

  const [dateFrom, setDateFrom] = useState(pendingDateFrom);
  const [dateTo, setDateTo] = useState(pendingDateTo);
  const [customerFilter, setCustomerFilter] = useState('');
  const [page, setPage] = useState(1);

  const onSearch = () => {
    setDateFrom(pendingDateFrom);
    setDateTo(pendingDateTo);
    setCustomerFilter(pendingCustomer);
    setPage(1);
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

  // Embedded usage (saleDateFrom passed in, e.g. from the Closing flow) needs
  // the complete matching set for its callback's ids/total, not one page of
  // it — only the standalone dashboard tab actually paginates.
  const { loading: saleLoading, data: saleData } = useQuery(GET_SALES, {
    variables: {
      date: {
        from: dateFrom.clone().startOf('day').toDate(),
        to: dateTo.clone().endOf('day').toDate(),
      },
      customer: customerFilter || undefined,
      page: saleDateFrom ? undefined : page,
      limit: saleDateFrom ? undefined : PAGE_SIZE,
    },
    fetchPolicy: 'no-cache',
  });

  const sales: Sale[] = saleData?.getSalesForUser?.items || [];
  const totalCount = saleData?.getSalesForUser?.totalCount || 0;
  const totalAmount = saleData?.getSalesForUser?.totalAmount || 0;
  const totalProfit = saleData?.getSalesForUser?.totalProfit || 0;

  useEffect(() => {
    if (saleData?.getSalesForUser && callback) {
      callback(
        sales.map((s) => s._id),
        totalAmount,
      );
    }
  }, [saleData]);

  const TotalSection = () => {
    return (
      <Box
        ml={hideExtraFields ? 'auto' : undefined}
        textAlign={hideExtraFields ? 'right' : undefined}
      >
        <Text fontSize="sm" color="fg.muted">
          {'Total'}
        </Text>
        <Text
          color={totalProfit > 0 ? 'green.600' : 'red.600'}
          fontWeight="medium"
        >
          {totalAmount}
          {currency}
        </Text>
        <Text fontSize="sm" color="fg.muted" mt={1}>
          {'Profile/Loss'}
        </Text>
        <Text
          color={totalProfit > 0 ? 'green.600' : 'red.600'}
          fontWeight="medium"
        >
          {totalProfit > 0 && '+'}
          {totalProfit}
          {currency}
        </Text>
      </Box>
    );
  };

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

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
              <Box minW="180px">
                <ContactSelect
                  label="Customer"
                  placeholder="Filter by customer"
                  entities={customerEntities}
                  value={pendingCustomer}
                  onSelect={(entity) => setPendingCustomer(entity?.name || '')}
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
            {!saleDateFrom && totalCount > PAGE_SIZE && (
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

export default Sales;
