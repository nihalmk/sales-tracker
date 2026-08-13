import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import { useQuery } from '@apollo/client';
import { GET_PURCHASE_BY_BILL_NUMBER } from '../../graphql/query/purchase';
import { Purchase, PurchaseItem } from '../../generated/graphql';
import Loader from '../Loaders/Loader';
import moment from 'moment-timezone';
import { currency } from '../../utils/helpers';
import {
  Card,
  SimpleGrid,
  Table,
  Button,
  HStack,
  Text,
  IconButton,
} from '@chakra-ui/react';
import Icon from '../common/Icon';

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

  const { loading: purchaseLoading, data: purchaseData } = useQuery(
    GET_PURCHASE_BY_BILL_NUMBER,
    {
      variables: {
        billNumber,
      },
      skip: !billNumber,
      fetchPolicy: 'no-cache',
    },
  );

  const [purchase, setPurchase] = useState<Purchase>();

  useEffect(() => {
    setPurchase(purchaseData?.getPurchaseByBillNumber?.[0]);
  }, [purchaseData]);

  useEffect(() => {
    setPurchase(purchaseDetails);
  }, [purchase]);

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
      {view && (
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
                  <Table.ColumnHeader textAlign="end">Purchase Price</Table.ColumnHeader>
                  <Table.ColumnHeader textAlign="end">Quantity</Table.ColumnHeader>
                  <Table.ColumnHeader textAlign="end">Total</Table.ColumnHeader>
                  <Table.ColumnHeader textAlign="center">Action</Table.ColumnHeader>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {billNumber && purchaseLoading ? (
                  <Table.Row>
                    <Table.Cell textAlign="center" py={8} colSpan={6}>
                      <Loader />
                    </Table.Cell>
                  </Table.Row>
                ) : (
                  purchase?.items.length === 0 && (
                    <Table.Row>
                      <Table.Cell textAlign="center" py={8} colSpan={6}>
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
                            <Table.Cell color="fg.muted">{item.shortId}</Table.Cell>
                            <Table.Cell fontWeight="medium">{item.name}</Table.Cell>
                            <Table.Cell textAlign="end">{purchase.cost}</Table.Cell>
                            <Table.Cell textAlign="end">{purchase.quantity}</Table.Cell>
                            <Table.Cell textAlign="end" fontWeight="semibold">
                              {purchase.total}
                            </Table.Cell>
                            <Table.Cell textAlign="center" color="fg.muted">
                              —
                            </Table.Cell>
                          </Table.Row>
                        );
                      },
                    )}
                    <Table.Row bg="gray.50" borderTopWidth="2px" borderTopColor="gray.300">
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
              <Button
                className="hide-in-print"
                colorPalette="brand"
                ml="auto"
                disabled={true}
              >
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

export default PurchaseCard;
