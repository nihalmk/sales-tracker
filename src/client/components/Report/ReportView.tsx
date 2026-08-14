import React, { useState } from 'react';
import { useQuery } from '@apollo/client';
import _ from 'lodash';
import moment from 'moment-timezone';
import Link from 'next/link';
import { CreateClosingInput, Sale, Purchase } from '../../generated/graphql';
import { GET_CLOSINGS } from '../../graphql/query/closing';
import Sales from '../Sale/Sales';
import SalesItemsTable from '../Sale/SalesItemsTable';
import Purchases from '../Purchase/Purchases';
import PurchaseItemsTable from '../Purchase/PurchaseItemsTable';
import { Spent } from '../Closing/Spent';
import { Received } from '../Closing/Received';
import TopItemsChart from '../common/TopItemsChart';
import ExpandableSection from '../common/ExpandableSection';
import Loader from '../Loaders/Loader';
import Print from '../common/Print';
import Icon from '../common/Icon';
import { currency } from '../../utils/helpers';
import { Box, Button, Card, Heading, HStack, Text } from '@chakra-ui/react';
import {
  groupSalesByItem,
  groupPurchasesByItem,
  groupSpentByName,
  groupReceivedByName,
} from './aggregate';

interface Props {
  startDate: Date;
  endDate: Date;
}

// The read-only, date-range analysis view — separate from NewClosing.tsx's
// day-to-day closing workflow. A single-day range shows the same itemised
// detail Closing shows; a range spanning more than one day switches each
// section to a "most sold/spent on" ranked breakdown instead, since a raw
// itemised list of every transaction across weeks isn't useful for
// spotting patterns.
const ReportView: React.FC<Props> = ({ startDate, endDate }) => {
  const isMultiDay = moment(endDate).isAfter(moment(startDate), 'day');

  const { data: closingsData, loading: closingsLoading } = useQuery(
    GET_CLOSINGS,
    {
      variables: {
        date: {
          from: moment(startDate).startOf('day').toDate(),
          to: moment(endDate).endOf('day').toDate(),
        },
      },
      fetchPolicy: 'no-cache',
    },
  );

  const allClosings = (closingsData?.getClosingForUser ||
    []) as CreateClosingInput[];
  const spentItemsList = _.flatMap(allClosings.map((c) => c.spentItems || []));
  const receivedItemsList = _.flatMap(
    allClosings.map((c) => c.receivedItems || []),
  );
  const spentTotal = _.sum(spentItemsList.map((s) => s.amount));
  const receivedTotal = _.sum(receivedItemsList.map((s) => s.amount));

  const [salesTotal, setSalesTotal] = useState(0);
  const [purchaseTotal, setPurchaseTotal] = useState(0);
  const [salesRecords, setSalesRecords] = useState<Sale[]>([]);
  const [purchaseRecords, setPurchaseRecords] = useState<Purchase[]>([]);
  const [salesView, setSalesView] = useState(false);
  const [purchasesView, setPurchasesView] = useState(false);
  const [spentView, setSpentView] = useState(false);
  const [receivedView, setRecievedView] = useState(false);

  if (closingsLoading) {
    return (
      <React.Fragment>
        <Text textAlign="center" py={4} color="fg.muted">
          Getting report data...
        </Text>
        <Loader />
      </React.Fragment>
    );
  }

  if (allClosings.length === 0) {
    return (
      <Card.Root variant="outline">
        <Text textAlign="center" py={4}>
          No closing found
        </Text>
      </Card.Root>
    );
  }

  const salesProfit = _.sum(salesRecords.map((s) => s.profit));

  return (
    <Card.Root variant="elevated" borderRadius="l3" mb={5}>
      <Card.Header>
        <HStack gap={2}>
          <Icon name="report" boxSize={5} />
          <Heading size="md">
            Report | {moment(startDate).format('DD/MM/YYYY')}
            {isMultiDay && ` - ${moment(endDate).format('DD/MM/YYYY')}`}
          </Heading>
        </HStack>
      </Card.Header>
      <Card.Body pb={0}>
        {/* Headless — drives the ids/total/records used below; nothing
            here is rendered. */}
        <Box display="none">
          <Sales
            hideExtraFields
            saleDateFrom={startDate}
            saleDateTo={endDate}
            callback={(_ids, total, records) => {
              setSalesTotal(total);
              setSalesRecords(records || []);
            }}
          />
        </Box>
        <ExpandableSection
          icon="sales"
          label="Sales"
          isOpen={salesView}
          onToggle={() => setSalesView(!salesView)}
          badge={
            <Text
              fontWeight="medium"
              color={salesProfit >= 0 ? 'green.600' : 'red.600'}
            >
              {salesTotal}
              {currency}
            </Text>
          }
        >
          {isMultiDay ? (
            <TopItemsChart
              rows={groupSalesByItem(salesRecords)}
              quantityLabel="sold"
              emptyMessage="No sales found"
            />
          ) : (
            <SalesItemsTable sales={salesRecords} />
          )}
        </ExpandableSection>
        <Box display="none">
          <Purchases
            hideExtraFields
            purchaseFromDate={startDate}
            purchaseToDate={endDate}
            callback={(_ids, total, records) => {
              setPurchaseTotal(total);
              setPurchaseRecords(records || []);
            }}
          />
        </Box>
        <ExpandableSection
          icon="purchases"
          label="Purchases"
          isOpen={purchasesView}
          onToggle={() => setPurchasesView(!purchasesView)}
          badge={
            <Text fontWeight="medium" color="red.600">
              -{purchaseTotal}
              {currency}
            </Text>
          }
        >
          {isMultiDay ? (
            <TopItemsChart
              rows={groupPurchasesByItem(purchaseRecords)}
              quantityLabel="bought"
              emptyMessage="No purchases found"
            />
          ) : (
            <PurchaseItemsTable purchases={purchaseRecords} />
          )}
        </ExpandableSection>
        <ExpandableSection
          icon="expenses"
          label="Expenses"
          isOpen={spentView}
          onToggle={() => setSpentView(!spentView)}
          badge={
            <Text fontWeight="medium" color="red.600">
              {spentTotal}
              {currency}
            </Text>
          }
        >
          {isMultiDay ? (
            <TopItemsChart
              rows={groupSpentByName(spentItemsList)}
              emptyMessage="No money spent"
            />
          ) : (
            <Spent isView spentItemsList={spentItemsList} id="report-spent" />
          )}
        </ExpandableSection>
        <ExpandableSection
          icon="received"
          label="Received"
          isOpen={receivedView}
          onToggle={() => setRecievedView(!receivedView)}
          badge={
            <Text fontWeight="medium" color="green.600">
              {receivedTotal}
              {currency}
            </Text>
          }
        >
          {isMultiDay ? (
            <TopItemsChart
              rows={groupReceivedByName(receivedItemsList)}
              emptyMessage="No money received"
            />
          ) : (
            <Received
              isView
              receivedItemsList={receivedItemsList}
              id="report-received"
            />
          )}
        </ExpandableSection>
      </Card.Body>
      <Card.Footer>
        <HStack w="full">
          <Button
            asChild
            className="hide-in-print"
            variant="outline"
            colorPalette="gray"
          >
            <Link href="/dashboard">
              <Icon name="cancel" />
              Back to Dashboard
            </Link>
          </Button>
          <Box ml="auto">
            {/* Print runs setPrintStatus, then window.print() on the next
                tick — expanding every accordion here means the printed
                page shows all the detail, not just whichever sections
                happened to be open on screen. */}
            <Print
              setPrintStatus={() => {
                setSalesView(true);
                setPurchasesView(true);
                setSpentView(true);
                setRecievedView(true);
              }}
            />
          </Box>
        </HStack>
      </Card.Footer>
    </Card.Root>
  );
};

export default ReportView;
