import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import dynamic from 'next/dynamic';
import { useLazyQuery, useQuery } from '@apollo/client';
import { GET_SALE_BY_BILL_NUMBER } from '../../graphql/query/sale';
import { GET_PREVIOUS_CLOSING } from '../../graphql/query/closing';
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
import DiscountBanner from '../common/DiscountBanner';
import MissingMrpWarning, { MrpWarningItem } from '../common/MissingMrpWarning';
import Tooltip from '../common/Tooltip';

// Dynamic import — AddSale (imported statically here for the inline edit
// view) itself renders the Sales list, which renders this SaleCard, so a
// static import would be circular.
const AddSale = dynamic(() => import('./AddSale'));

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
  const [isEditing, setIsEditing] = useState(false);

  const [sale, setSale] = useState<Sale>();

  useEffect(() => {
    setSale(saleDetails);
  }, [saleDetails]);

  const currentBillNumber = billNumber || sale?.billNumber;

  // Lazy rather than an eager `useQuery`: when this card is embedded in a
  // list (`saleDetails` prop, no `billNumber`), the list's own query already
  // supplied the initial data above — firing an extra per-card query on
  // mount would turn one list query into N. It's only needed (a) up front
  // for standalone/single-sale usage (`billNumber` prop passed directly),
  // and (b) on demand right after a successful edit, since neither this
  // card nor its parent list otherwise learns the edit happened.
  const [fetchSale, { loading: saleLoading, data: saleData }] = useLazyQuery(
    GET_SALE_BY_BILL_NUMBER,
    { fetchPolicy: 'no-cache' },
  );

  useEffect(() => {
    if (billNumber) {
      fetchSale({ variables: { billNumber } });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [billNumber]);

  useEffect(() => {
    if (saleData?.getSaleByBillNumber?.[0]) {
      setSale(saleData.getSaleByBillNumber[0]);
    }
  }, [saleData]);
  // A sale is locked once it falls on or before the shop's most recent
  // *finalized* closing's date — a per-record `closing` ref can't be
  // trusted here: a closing can sweep up a multi-day backlog in one go,
  // and a draft closing (active: false) locks nothing at all.
  const { data: lastClosingData } = useQuery(GET_PREVIOUS_CLOSING, {
    fetchPolicy: 'no-cache',
  });
  const lastActiveClosing = lastClosingData?.getPreviousClosing;
  const isEditable =
    !lastActiveClosing ||
    moment(sale?.createdAt).isAfter(moment(lastActiveClosing.date), 'day');

  const getDiscountLineItems = () =>
    (sale?.items || []).map((saleItem) => ({
      id: saleItem.item._id,
      name: saleItem.item.name,
      mrp: saleItem.item?.price?.list || 0,
      salePrice: saleItem.cost,
      quantity: saleItem.quantity,
    }));

  // Patches the fixed item's price on this already-loaded sale record so the
  // warning icon and discount math update immediately — no refetch or page
  // reload needed.
  const onItemMrpUpdated = (updated: MrpWarningItem) => {
    setSale((current) => ({
      ...current,
      items: current.items.map((si) =>
        si.item._id === updated._id
          ? { ...si, item: { ...si.item, price: updated.price } }
          : si,
      ),
    }));
  };

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
      {view && isEditing && (
        <Card.Body>
          <AddSale
            billNumber={currentBillNumber}
            onCancel={() => setIsEditing(false)}
            onSaved={() => {
              setIsEditing(false);
              if (currentBillNumber) {
                fetchSale({ variables: { billNumber: currentBillNumber } });
              }
            }}
          />
        </Card.Body>
      )}
      {view && !isEditing && (
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
                  <Table.ColumnHeader textAlign="end">MRP</Table.ColumnHeader>
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
                    <Table.Cell textAlign="center" py={8} colSpan={7}>
                      <Loader />
                    </Table.Cell>
                  </Table.Row>
                ) : (
                  sale?.items.length === 0 && (
                    <Table.Row>
                      <Table.Cell textAlign="center" py={8} colSpan={7}>
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
                            <MissingMrpWarning
                              item={item}
                              fallbackPrice={sale.cost}
                              onUpdated={onItemMrpUpdated}
                            />
                          </Table.Cell>
                          <Table.Cell textAlign="end">
                            <Text
                              as="span"
                              color="blue.600"
                              fontWeight="medium"
                            >
                              {sale.cost}
                            </Text>
                          </Table.Cell>
                          <Table.Cell textAlign="end" color="gray.500">
                            {item.price?.list || '-'}
                          </Table.Cell>
                          <Table.Cell textAlign="end">
                            {sale.quantity}
                          </Table.Cell>
                          <Table.Cell
                            textAlign="end"
                            fontWeight="semibold"
                            color="purple.700"
                          >
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
                      <Table.Cell colSpan={5}>
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
                      <Table.Cell
                        textAlign="end"
                        fontWeight="bold"
                        color="purple.700"
                      >
                        {sale?.total}
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
              <Tooltip
                content={
                  isEditable
                    ? 'Edit this sale'
                    : "This sale is part of a closed day and can't be edited."
                }
              >
                {/* Wrapped so the tooltip still shows on hover even while
                    the Button itself is natively disabled. */}
                <Box display="inline-block" className="hide-in-print">
                  <Button
                    colorPalette="brand"
                    disabled={!isEditable}
                    onClick={() => setIsEditing(true)}
                  >
                    <Icon name="edit" light />
                    Edit
                  </Button>
                </Box>
              </Tooltip>
            </HStack>
          </Card.Footer>
        </React.Fragment>
      )}
    </Card.Root>
  );
};

export default SaleCard;
