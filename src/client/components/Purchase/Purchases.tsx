import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import { useQuery } from '@apollo/client';
import { GET_PURCHASES } from '../../graphql/query/purchase';
import _ from 'lodash';
import { Purchase } from '../../generated/graphql';
import Loader from '../Loaders/Loader';
import moment from 'moment-timezone';
import PurchaseCard from './Purchase';
import DatePicker from '../common/DatePicker/DatePicker';
import { Box, Card, Flex, Text } from '@chakra-ui/react';

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
  const [date, setDate] = useState(
    purchaseFromDate ? moment(purchaseFromDate) : moment(),
  );
  const { loading: purchaseLoading, data: purchaseData } = useQuery(
    GET_PURCHASES,
    {
      variables: {
        date: {
          from: date.startOf('day').toDate(),
          to: (purchaseToDate ? moment(purchaseToDate) : date)
            .endOf('day')
            .toDate(),
        },
      },
      fetchPolicy: 'no-cache',
    },
  );

  const [purchases, setPurchases] = useState<Purchase[]>();

  useEffect(() => {
    setPurchases(
      purchaseData?.getPurchasesForUser.sort(
        (a: Purchase, b: Purchase) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      ),
    );
  }, [purchaseData]);

  useEffect(() => {
    if (purchases && callback) {
      callback(
        purchases.map((s) => s._id),
        _.sum(purchases.map((s) => s.total)),
      );
    }
  }, [purchases]);

  const getTotal = () => {
    const total = _.sum(purchases?.map((s) => s.total));
    return total;
  };

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
          -{getTotal()}₹
        </Text>
      </Box>
    );
  };
  return (
    <React.Fragment>
      <Box>
        <Flex align="flex-start" wrap="wrap" gap={4} mb={4}>
          <TotalSection />
          {!purchaseFromDate && (
            <Box ml="auto" minW="200px">
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
          </React.Fragment>
        )}
      </Box>
    </React.Fragment>
  );
};

export default Purchases;
