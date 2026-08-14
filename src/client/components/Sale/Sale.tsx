import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import { useQuery } from '@apollo/client';
import { GET_SALE_BY_BILL_NUMBER } from '../../graphql/query/sale';
import { Sale, SaleItem } from '../../generated/graphql';
import Loader from '../Loaders/Loader';
import moment from 'moment-timezone';
import { currency } from '../../utils/helpers';
import {
  Box,
  Card,
  SimpleGrid,
  Table,
  Button,
  HStack,
  Text,
  IconButton,
} from '@chakra-ui/react';
import Icon from '../common/Icon';
import DiscountBanner, {
  calculateDiscounts,
} from '../common/DiscountBanner';

interface Props {
  billNumber?: string;
  saleDetails?: Sale;
  showContent?: boolean;
}

const SaleCard: NextPage<Props> = function ({
  billNumber,
  saleDetails,
  showContent = true,
}) {
  const [view, setView] = useState(showContent);
  const [isPrinting, setIsPrinting] = useState(false);
  const [selectedPrint, setSelectedPrint] = useState('');
  const [showProfit, setShowProfit] = useState(false);

  const { loading: saleLoading, data: saleData } = useQuery(
    GET_SALE_BY_BILL_NUMBER,
    {
      variables: {
        billNumber,
      },
      skip: !billNumber,
      fetchPolicy: 'no-cache',
    },
  );

  const [sale, setSale] = useState<Sale>();

  useEffect(() => {
    setSale(saleData?.getSaleByBillNumber?.[0]);
  }, [saleData]);

  useEffect(() => {
    setSale(saleDetails);
  }, [sale]);

  const currentBillNumber = billNumber || sale?.billNumber;

  const getDiscountLineItems = () =>
    (sale?.items || []).map((saleItem) => ({
      id: saleItem.item._id,
      name: saleItem.item.name,
      mrp: saleItem.item?.price?.list || 0,
      salePrice: saleItem.cost,
      quantity: saleItem.quantity,
    }));

  return (
    <Card.Root
      className={selectedPrint !== currentBillNumber ? 'hide-in-print' : ''}
      id={`sale-${currentBillNumber}`}
      variant="outline"
      mb={4}
    >
      <Card.Header>
        <HStack justify="space-between" wrap="wrap">
          <Text fontWeight="semibold">
            #{currentBillNumber} |{' '}
            {moment(sale?.createdAt).format('MMMM Do YYYY, h:mm:ss a')}
          </Text>
          <HStack className="hide-in-print" gap={3}>
            <Text fontWeight="bold" color="green.600">
              {sale?.total}
              {currency}
            </Text>
            <IconButton
              size="sm"
              variant="outline"
              colorPalette="gray"
              aria-label={view ? 'Collapse' : 'Expand'}
              onClick={() => {
                setView(!view);
              }}
            >
              {view ? '-' : '+'}
            </IconButton>
          </HStack>
        </HStack>
      </Card.Header>
      {view && (
        <React.Fragment>
          <Card.Body>
            <SimpleGrid columns={{ base: 1, md: 3 }} gap={4}>
              <Text>
                <strong>Customer: </strong> {sale?.customer}
              </Text>
              <Text>
                <strong>Contact: </strong> {sale?.contact}
              </Text>
              <Text>
                <strong>Email: </strong> {sale?.email}
              </Text>
            </SimpleGrid>
          </Card.Body>

          <Table.ScrollArea>
            <Table.Root variant="outline" size="sm" striped interactive>
              <Table.Header>
                <Table.Row>
                  <Table.ColumnHeader>#ID</Table.ColumnHeader>
                  <Table.ColumnHeader>Product</Table.ColumnHeader>
                  <Table.ColumnHeader textAlign="end">
                    Sale Price
                  </Table.ColumnHeader>
                  <Table.ColumnHeader textAlign="end">
                    Quantity
                  </Table.ColumnHeader>
                  <Table.ColumnHeader textAlign="end">Total</Table.ColumnHeader>
                  <Table.ColumnHeader textAlign="center">
                    Action
                  </Table.ColumnHeader>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {billNumber && saleLoading ? (
                  <Table.Row>
                    <Table.Cell textAlign="center" py={8} colSpan={6}>
                      <Loader />
                    </Table.Cell>
                  </Table.Row>
                ) : (
                  sale?.items.length === 0 && (
                    <Table.Row>
                      <Table.Cell textAlign="center" py={8} colSpan={6}>
                        <Text color="fg.muted" fontSize="sm">
                          No products added
                        </Text>
                      </Table.Cell>
                    </Table.Row>
                  )
                )}
                {!saleLoading && sale?.items?.length !== 0 && (
                  <React.Fragment>
                    {sale?.items?.map((sale: SaleItem, i: number) => {
                      const item = sale.item;
                      const profit = sale.cost - item?.price?.cost;
                      const isProfit = profit > 0;
                      return (
                        <Table.Row key={i}>
                          <Table.Cell color="fg.muted">
                            {item.shortId}
                          </Table.Cell>
                          <Table.Cell fontWeight="medium">
                            {item.name}
                          </Table.Cell>
                          <Table.Cell textAlign="end">{sale.cost}</Table.Cell>
                          <Table.Cell textAlign="end">
                            {sale.quantity}
                          </Table.Cell>
                          <Table.Cell textAlign="end" fontWeight="semibold">
                            {sale.total}
                            {showProfit && (
                              <Box
                                as="span"
                                ml={2}
                                color={isProfit ? 'green.600' : 'red.600'}
                                fontWeight="medium"
                              >
                                {isProfit && '+'}
                                {profit}
                              </Box>
                            )}
                          </Table.Cell>
                          <Table.Cell textAlign="center" color="fg.muted">
                            —
                          </Table.Cell>
                        </Table.Row>
                      );
                    })}
                    <Table.Row
                      bg="gray.50"
                      borderTopWidth="2px"
                      borderTopColor="gray.300"
                    >
                      <Table.Cell colSpan={4}>
                        <Text
                          fontWeight="bold"
                          fontSize="xs"
                          textTransform="uppercase"
                          letterSpacing="wider"
                          color="gray.600"
                        >
                          Total
                        </Text>
                      </Table.Cell>
                      <Table.Cell textAlign="end" fontWeight="bold">
                        {sale?.total}
                        {(() => {
                          const { totalDiscount, totalDiscountPercent } =
                            calculateDiscounts(getDiscountLineItems());
                          return (
                            !!totalDiscount && (
                              <Text
                                fontSize="xs"
                                fontWeight="medium"
                                color="green.600"
                              >
                                −{totalDiscount}₹ discount (
                                {totalDiscountPercent}%)
                              </Text>
                            )
                          );
                        })()}
                      </Table.Cell>
                      <Table.Cell>
                        {showProfit && (
                          <Box
                            as="span"
                            color={sale?.profit > 0 ? 'green.600' : 'red.600'}
                            fontWeight="bold"
                          >
                            {sale?.profit > 0 ? '+' : ''}
                            {sale?.profit}
                          </Box>
                        )}
                      </Table.Cell>
                    </Table.Row>
                  </React.Fragment>
                )}
              </Table.Body>
            </Table.Root>
          </Table.ScrollArea>
          {!!sale?.items?.length && (
            <Card.Body pt={0}>
              <DiscountBanner items={getDiscountLineItems()} />
            </Card.Body>
          )}
          <Card.Footer>
            <HStack w="full">
              {currentBillNumber && (
                <Button
                  className="hide-in-print"
                  colorPalette="brand"
                  loading={isPrinting}
                  onClick={() => {
                    setSelectedPrint(currentBillNumber);
                    setTimeout(() => {
                      setIsPrinting(true);
                      window && window.print();
                      setIsPrinting(false);
                      setSelectedPrint(undefined);
                    }, 0);
                  }}
                >
                  <Icon name="print" light />
                  Print
                </Button>
              )}
              <Button
                className="hide-in-print"
                colorPalette="gray"
                variant="outline"
                ml="auto"
                onClick={() => setShowProfit(!showProfit)}
              >
                {showProfit ? 'Hide P/L' : 'P/L'}
              </Button>
              <Button className="hide-in-print" colorPalette="brand" disabled={true}>
                <Icon name="edit" light />
                Edit
              </Button>
            </HStack>
          </Card.Footer>
        </React.Fragment>
      )}
    </Card.Root>
  );
};

export default SaleCard;
