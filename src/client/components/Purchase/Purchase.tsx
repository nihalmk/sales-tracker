import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import { useLazyQuery, useQuery } from '@apollo/client';
import { GET_PURCHASE_BY_BILL_NUMBER } from '../../graphql/query/purchase';
import { GET_PREVIOUS_CLOSING } from '../../graphql/query/closing';
import { Purchase, PurchaseItem } from '../../generated/graphql';
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
import Tooltip from '../common/Tooltip';
import AddPurchase from './AddPurchase';

interface Props {
  billNumber?: string;
  purchaseDetails?: Purchase;
  showContent?: boolean;
}

const PurchaseCard: NextPage<Props> = function ({
  billNumber,
  purchaseDetails,
  showContent = true,
}) {
  const [view, setView] = useState(showContent);
  const [isEditing, setIsEditing] = useState(false);

  const [purchase, setPurchase] = useState<Purchase>();

  useEffect(() => {
    setPurchase(purchaseDetails);
  }, [purchaseDetails]);

  const currentBillNumber = billNumber || purchase?.billNumber;

  // Lazy rather than an eager `useQuery`: when this card is embedded in a
  // list (`purchaseDetails` prop, no `billNumber`), the list's own query
  // already supplied the initial data above — firing an extra per-card
  // query on mount would turn one list query into N. It's only needed (a)
  // up front for standalone/single-purchase usage (`billNumber` prop passed
  // directly), and (b) on demand right after a successful edit, since
  // neither this card nor its parent list otherwise learns the edit
  // happened.
  const [fetchPurchase, { loading: purchaseLoading, data: purchaseData }] =
    useLazyQuery(GET_PURCHASE_BY_BILL_NUMBER, { fetchPolicy: 'no-cache' });

  useEffect(() => {
    if (billNumber) {
      fetchPurchase({ variables: { billNumber } });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [billNumber]);

  useEffect(() => {
    if (purchaseData?.getPurchaseByBillNumber?.[0]) {
      setPurchase(purchaseData.getPurchaseByBillNumber[0]);
    }
  }, [purchaseData]);
  // A purchase is locked once it falls on or before the shop's most recent
  // *finalized* closing's date — a per-record `closing` ref can't be
  // trusted here: a closing can sweep up a multi-day backlog in one go,
  // and a draft closing (active: false) locks nothing at all.
  const { data: lastClosingData } = useQuery(GET_PREVIOUS_CLOSING, {
    fetchPolicy: 'no-cache',
  });
  const lastActiveClosing = lastClosingData?.getPreviousClosing;
  const isEditable =
    !lastActiveClosing ||
    moment(purchase?.createdAt).isAfter(moment(lastActiveClosing.date), 'day');

  return (
    <Card.Root variant="outline" mb={4}>
      <Card.Header>
        <HStack justify="space-between" wrap="wrap">
          <Text fontWeight="semibold">
            #{billNumber || purchase?.billNumber} |{' '}
            {moment(purchase?.createdAt).format('MMMM Do YYYY, h:mm:ss a')}
          </Text>
          <HStack gap={3}>
            <Text fontWeight="bold" color="red.600">
              {purchase?.total}
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
          <AddPurchase
            billNumber={currentBillNumber}
            onCancel={() => setIsEditing(false)}
            onSaved={() => {
              setIsEditing(false);
              if (currentBillNumber) {
                fetchPurchase({
                  variables: { billNumber: currentBillNumber },
                });
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
                <strong>Vendor: </strong> {purchase?.vendor}
              </Text>
              <Text>
                <strong>Contact: </strong> {purchase?.contact}
              </Text>
              <Text>
                <strong>Email: </strong> {purchase?.email}
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
                    Purchase Price
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
                {billNumber && purchaseLoading ? (
                  <Table.Row>
                    <Table.Cell textAlign="center" py={8} colSpan={7}>
                      <Loader />
                    </Table.Cell>
                  </Table.Row>
                ) : (
                  purchase?.items.length === 0 && (
                    <Table.Row>
                      <Table.Cell textAlign="center" py={8} colSpan={7}>
                        <Text color="fg.muted" fontSize="sm">
                          No products added
                        </Text>
                      </Table.Cell>
                    </Table.Row>
                  )
                )}
                {!purchaseLoading && purchase?.items?.length !== 0 && (
                  <React.Fragment>
                    {purchase?.items?.map(
                      (purchase: PurchaseItem, i: number) => {
                        const item = purchase.item;
                        return (
                          <Table.Row key={i}>
                            <Table.Cell color="fg.muted">
                              {item.shortId}
                            </Table.Cell>
                            <Table.Cell fontWeight="medium">
                              {item.name}
                            </Table.Cell>
                            <Table.Cell textAlign="end">
                              <Text
                                as="span"
                                color="blue.600"
                                fontWeight="medium"
                              >
                                {purchase.cost}
                              </Text>
                            </Table.Cell>
                            <Table.Cell textAlign="end" color="gray.500">
                              {purchase.list || item.price?.list || '-'}
                            </Table.Cell>
                            <Table.Cell textAlign="end">
                              {purchase.quantity}
                            </Table.Cell>
                            <Table.Cell
                              textAlign="end"
                              fontWeight="semibold"
                              color="purple.700"
                            >
                              {purchase.total}
                            </Table.Cell>
                            <Table.Cell textAlign="center" color="fg.muted">
                              —
                            </Table.Cell>
                          </Table.Row>
                        );
                      },
                    )}
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
                        {purchase?.total}
                      </Table.Cell>
                      <Table.Cell></Table.Cell>
                    </Table.Row>
                  </React.Fragment>
                )}
              </Table.Body>
            </Table.Root>
          </Table.ScrollArea>
          <Card.Footer>
            <HStack w="full">
              <Tooltip
                content={
                  isEditable
                    ? 'Edit this purchase'
                    : "This purchase is part of a closed day and can't be edited."
                }
              >
                {/* Wrapped so the tooltip still shows on hover even while
                    the Button itself is natively disabled. */}
                <Box display="inline-block" ml="auto" className="hide-in-print">
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

export default PurchaseCard;
