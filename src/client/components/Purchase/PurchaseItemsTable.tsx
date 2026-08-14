import React, { useState } from 'react';
import _ from 'lodash';
import moment from 'moment-timezone';
import { Purchase, PurchaseItem } from '../../generated/graphql';
import { currency } from '../../utils/helpers';
import {
  Box,
  Button,
  HStack,
  IconButton,
  Table,
  Text,
} from '@chakra-ui/react';
import Icon from '../common/Icon';
import Tooltip from '../common/Tooltip';
import OverLay from '../OverLay';
import PurchaseCard from './Purchase';

interface Props {
  purchases: Purchase[];
}

interface Row {
  key: string;
  purchase: Purchase;
  purchaseItem: PurchaseItem;
}

// Flattens every purchase in the period into one itemised table (one row
// per line item, not one card per purchase) — the "See purchase" action
// opens the full PurchaseCard, read-only, for whichever bill that row
// belongs to.
const PurchaseItemsTable: React.FC<Props> = ({ purchases }) => {
  const [viewingBillNumber, setViewingBillNumber] = useState<string>();

  const rows: Row[] = _.flatMap(purchases, (purchase) =>
    (purchase.items || []).map((purchaseItem, i) => ({
      key: `${purchase._id}-${i}`,
      purchase,
      purchaseItem,
    })),
  );

  const grandTotal = _.sum(rows.map((r) => r.purchaseItem.total));

  return (
    <React.Fragment>
      <Table.ScrollArea>
        <Table.Root variant="outline" size="sm" striped interactive>
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeader>Bill#</Table.ColumnHeader>
              <Table.ColumnHeader>Date</Table.ColumnHeader>
              <Table.ColumnHeader>Vendor</Table.ColumnHeader>
              <Table.ColumnHeader>Item</Table.ColumnHeader>
              <Table.ColumnHeader textAlign="end">Cost</Table.ColumnHeader>
              <Table.ColumnHeader textAlign="end">Quantity</Table.ColumnHeader>
              <Table.ColumnHeader textAlign="end">Total</Table.ColumnHeader>
              <Table.ColumnHeader textAlign="center">
                Action
              </Table.ColumnHeader>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {rows.length === 0 ? (
              <Table.Row>
                <Table.Cell textAlign="center" py={8} colSpan={8}>
                  <Text color="fg.muted" fontSize="sm">
                    No purchases found
                  </Text>
                </Table.Cell>
              </Table.Row>
            ) : (
              <React.Fragment>
                {rows.map(({ key, purchase, purchaseItem }) => (
                  <Table.Row key={key}>
                    <Table.Cell color="fg.muted">
                      {purchase.billNumber}
                    </Table.Cell>
                    <Table.Cell>
                      {moment(purchase.createdAt).format('DD/MM/YYYY h:mm a')}
                    </Table.Cell>
                    <Table.Cell>{purchase.vendor || '-'}</Table.Cell>
                    <Table.Cell fontWeight="medium">
                      {purchaseItem.item?.name}
                    </Table.Cell>
                    <Table.Cell textAlign="end">
                      <Text as="span" color="blue.600" fontWeight="medium">
                        {purchaseItem.cost}
                      </Text>
                    </Table.Cell>
                    <Table.Cell textAlign="end">
                      {purchaseItem.quantity}
                    </Table.Cell>
                    <Table.Cell
                      textAlign="end"
                      fontWeight="semibold"
                      color="purple.700"
                    >
                      {purchaseItem.total}
                    </Table.Cell>
                    <Table.Cell textAlign="center">
                      <Tooltip content="See purchase">
                        <IconButton
                          aria-label="See purchase"
                          size="sm"
                          variant="ghost"
                          className="hide-in-print"
                          onClick={() =>
                            setViewingBillNumber(purchase.billNumber)
                          }
                        >
                          <Icon name="search" />
                        </IconButton>
                      </Tooltip>
                    </Table.Cell>
                  </Table.Row>
                ))}
                <Table.Row
                  bg="gray.50"
                  borderTopWidth="2px"
                  borderTopColor="gray.300"
                >
                  <Table.Cell colSpan={6}>
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
                    {grandTotal}
                    {currency}
                  </Table.Cell>
                  <Table.Cell></Table.Cell>
                </Table.Row>
              </React.Fragment>
            )}
          </Table.Body>
        </Table.Root>
      </Table.ScrollArea>
      <OverLay show={!!viewingBillNumber} className="hide-in-print">
        <Box p={3}>
          <HStack justify="flex-end" mb={2}>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setViewingBillNumber(undefined)}
            >
              <Icon name="cancel" />
              Close
            </Button>
          </HStack>
          {viewingBillNumber && (
            <PurchaseCard billNumber={viewingBillNumber} readOnly />
          )}
        </Box>
      </OverLay>
    </React.Fragment>
  );
};

export default PurchaseItemsTable;
