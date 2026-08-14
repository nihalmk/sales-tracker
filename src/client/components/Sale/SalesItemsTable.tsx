import React, { useState } from 'react';
import _ from 'lodash';
import moment from 'moment-timezone';
import { Sale, SaleItem } from '../../generated/graphql';
import { currency } from '../../utils/helpers';
import { Box, Button, HStack, IconButton, Table, Text } from '@chakra-ui/react';
import Icon from '../common/Icon';
import Tooltip from '../common/Tooltip';
import OverLay from '../OverLay';
import SaleCard from './Sale';

interface Props {
  sales: Sale[];
}

interface Row {
  key: string;
  sale: Sale;
  saleItem: SaleItem;
}

// Flattens every sale in the period into one itemised table (one row per
// line item, not one card per sale) — the "See sale" action opens the full
// SaleCard, read-only, for whichever bill that row belongs to.
const SalesItemsTable: React.FC<Props> = ({ sales }) => {
  const [viewingBillNumber, setViewingBillNumber] = useState<string>();

  const rows: Row[] = _.flatMap(sales, (sale) =>
    (sale.items || []).map((saleItem, i) => ({
      key: `${sale._id}-${i}`,
      sale,
      saleItem,
    })),
  );

  const grandTotal = _.sum(rows.map((r) => r.saleItem.total));

  return (
    <React.Fragment>
      <Table.ScrollArea>
        <Table.Root variant="outline" size="sm" striped interactive>
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeader>Bill#</Table.ColumnHeader>
              <Table.ColumnHeader>Date</Table.ColumnHeader>
              <Table.ColumnHeader>Customer</Table.ColumnHeader>
              <Table.ColumnHeader>Item</Table.ColumnHeader>
              <Table.ColumnHeader textAlign="end">Price</Table.ColumnHeader>
              <Table.ColumnHeader textAlign="end">Quantity</Table.ColumnHeader>
              <Table.ColumnHeader textAlign="end">Total</Table.ColumnHeader>
              <Table.ColumnHeader textAlign="center">Action</Table.ColumnHeader>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {rows.length === 0 ? (
              <Table.Row>
                <Table.Cell textAlign="center" py={8} colSpan={8}>
                  <Text color="fg.muted" fontSize="sm">
                    No sales found
                  </Text>
                </Table.Cell>
              </Table.Row>
            ) : (
              <React.Fragment>
                {rows.map(({ key, sale, saleItem }) => (
                  <Table.Row key={key}>
                    <Table.Cell color="fg.muted">{sale.billNumber}</Table.Cell>
                    <Table.Cell>
                      {moment(sale.createdAt).format('DD/MM/YYYY h:mm a')}
                    </Table.Cell>
                    <Table.Cell>{sale.customer || '-'}</Table.Cell>
                    <Table.Cell fontWeight="medium">
                      {saleItem.item?.name}
                    </Table.Cell>
                    <Table.Cell textAlign="end">
                      <Text as="span" color="blue.600" fontWeight="medium">
                        {saleItem.cost}
                      </Text>
                    </Table.Cell>
                    <Table.Cell textAlign="end">{saleItem.quantity}</Table.Cell>
                    <Table.Cell
                      textAlign="end"
                      fontWeight="semibold"
                      color="purple.700"
                    >
                      {saleItem.total}
                    </Table.Cell>
                    <Table.Cell textAlign="center">
                      <Tooltip content="See sale">
                        <IconButton
                          aria-label="See sale"
                          size="sm"
                          variant="ghost"
                          className="hide-in-print"
                          onClick={() => setViewingBillNumber(sale.billNumber)}
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
            <SaleCard billNumber={viewingBillNumber} readOnly />
          )}
        </Box>
      </OverLay>
    </React.Fragment>
  );
};

export default SalesItemsTable;
