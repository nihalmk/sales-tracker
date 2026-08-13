import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import { useQuery } from '@apollo/client';
import { GET_SALES } from '../../graphql/query/sale';
import _ from 'lodash';
import { Sale } from '../../generated/graphql';
import Loader from '../Loaders/Loader';
import moment from 'moment-timezone';
import SaleCard from './Sale';
import DatePicker from '../common/DatePicker/DatePicker';
import { currency } from '../../utils/helpers';
import { Box, Card, Flex, Text } from '@chakra-ui/react';

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
  const [date, setDate] = useState(
    saleDateFrom ? moment(saleDateFrom) : moment(),
  );
  const { loading: saleLoading, data: saleData } = useQuery(GET_SALES, {
    variables: {
      date: {
        from: date.startOf('day').toDate(),
        to: (saleDateTo ? moment(saleDateTo) : date).endOf('day').toDate(),
      },
    },
    fetchPolicy: 'no-cache',
  });

  const [sales, setSales] = useState<Sale[]>();

  useEffect(() => {
    setSales(
      saleData?.getSalesForUser.sort(
        (a: Sale, b: Sale) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      ),
    );
  }, [saleData]);

  useEffect(() => {
    if (sales && callback) {
      callback(
        sales.map((s) => s._id),
        _.sum(sales.map((s) => s.total)),
      );
    }
  }, [sales]);

  const total = _.sum(sales?.map((s) => s.total));
  const getTotalProfit = () => {
    const profit =
      total -
      _.sum(
        _.flatten(sales?.map((s) => s.items)).map(
          (i) => (i.item?.price?.cost || i.item?.price?.list) * i.quantity,
        ),
      );
    return profit;
  };

  const TotalSection = () => {
    return (
      <Box ml={hideExtraFields ? 'auto' : undefined} textAlign={hideExtraFields ? 'right' : undefined}>
        <Text fontSize="sm" color="fg.muted">{'Total'}</Text>
        <Text color={getTotalProfit() > 0 ? 'green.600' : 'red.600'} fontWeight="medium">
          {total}
          {currency}
        </Text>
        <Text fontSize="sm" color="fg.muted" mt={1}>{'Profile/Loss'}</Text>
        <Text color={getTotalProfit() > 0 ? 'green.600' : 'red.600'} fontWeight="medium">
          {getTotalProfit() > 0 && '+'}
          {getTotalProfit()}
          {currency}
        </Text>
      </Box>
    );
  };
  return (
    <React.Fragment>
      <Box>
        <Flex className="hide-in-print" align="flex-start" wrap="wrap" gap={4} mb={4}>
          <TotalSection />
          {!saleDateFrom && (
            <Box className="hide-in-print" ml="auto" minW="200px">
              <DatePicker
                inputLabel="Select Date"
                maxDate={new Date()}
                selected={date.toDate()}
                onChange={(selectedDate: Date) => {
                  setDate(moment(selectedDate));
                }}
              ></DatePicker>
            </Box>
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
          </React.Fragment>
        )}
      </Box>
    </React.Fragment>
  );
};

export default Sales;
