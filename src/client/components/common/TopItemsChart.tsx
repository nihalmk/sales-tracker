import React, { useState } from 'react';
import _ from 'lodash';
import { Box, Button, HStack, Text, VStack } from '@chakra-ui/react';
import { currency } from '../../utils/helpers';
import { ChartMetric, GroupedRow } from '../Report/aggregate';
import RankedBarList from './RankedBarList';
import OverLay from '../OverLay';
import Icon from './Icon';
import Tooltip from './Tooltip';

interface Props {
  rows: GroupedRow[];
  quantityLabel?: string;
  emptyMessage: string;
}

const TOP_N = 10;
const CHART_HEIGHT = 220;

// A vertical bar chart of the top 10 items, with everything past that
// collapsed into a single "Others" bar. Clicking "Others" opens the full,
// unbounded breakdown as a horizontal ranked list (RankedBarList) — the
// chart stays scannable at a glance, the popup answers "what exactly is in
// Others". When the rows carry a quantity (sales/purchases, not
// spent/received), a Money/<quantityLabel> toggle switches what ranks and
// sizes the bars.
const TopItemsChart: React.FC<Props> = ({
  rows,
  quantityLabel,
  emptyMessage,
}) => {
  const [showAll, setShowAll] = useState(false);
  const [metric, setMetric] = useState<ChartMetric>('total');
  const valueOf = (row: GroupedRow) =>
    metric === 'quantity' ? row.quantity || 0 : row.total;

  const sorted = [...rows].sort((a, b) => valueOf(b) - valueOf(a));

  if (sorted.length === 0) {
    return (
      <Text textAlign="center" py={8} color="fg.muted" fontSize="sm">
        {emptyMessage}
      </Text>
    );
  }

  const top = sorted.slice(0, TOP_N);
  const rest = sorted.slice(TOP_N);
  const hasQuantity = sorted[0]?.quantity !== undefined;
  const othersRow: GroupedRow | null = rest.length
    ? {
        name: 'Others',
        quantity: hasQuantity
          ? _.sum(rest.map((r) => r.quantity || 0))
          : undefined,
        total: _.sum(rest.map((r) => r.total)),
      }
    : null;

  const chartRows = othersRow ? [...top, othersRow] : top;
  const maxValue = Math.max(...chartRows.map(valueOf), 1);
  const metricLabel = quantityLabel && _.capitalize(quantityLabel);

  return (
    <React.Fragment>
      {metricLabel && (
        <HStack justify="flex-end" mb={3} gap={2} className="hide-in-print">
          <Button
            size="xs"
            variant={metric === 'total' ? 'solid' : 'outline'}
            colorPalette="brand"
            onClick={() => setMetric('total')}
          >
            Money
          </Button>
          <Button
            size="xs"
            variant={metric === 'quantity' ? 'solid' : 'outline'}
            colorPalette="brand"
            onClick={() => setMetric('quantity')}
          >
            {metricLabel}
          </Button>
        </HStack>
      )}
      <HStack
        align="flex-end"
        gap={3}
        h={`${CHART_HEIGHT}px`}
        overflowX="auto"
        pb={2}
      >
        {chartRows.map((row) => {
          const isOthers = row.name === 'Others';
          const heightPct = Math.max((valueOf(row) / maxValue) * 100, 3);
          return (
            <VStack
              key={row.name}
              justify="flex-end"
              h="full"
              flex="1"
              minW="56px"
              gap={1}
            >
              <Text fontSize="xs" fontWeight="semibold" color="fg.muted">
                {metric === 'quantity'
                  ? `${row.quantity} ${quantityLabel || 'units'}`
                  : `${row.total}${currency}`}
              </Text>
              <Box
                onClick={() => setShowAll(true)}
                w="full"
                borderRadius="md"
                bg={isOthers ? 'gray.400' : 'brand.solid'}
                height={`${heightPct}%`}
                transition="height 0.3s"
                cursor={'pointer'}
              />
              {isOthers ? (
                <Button
                  size="xs"
                  variant="ghost"
                  className="hide-in-print"
                  px={1}
                  h="auto"
                  minW={0}
                  fontWeight="medium"
                  onClick={() => setShowAll(true)}
                >
                  Others
                </Button>
              ) : (
                <Tooltip
                  content={
                    row.quantity !== undefined
                      ? `${row.name} — ${row.quantity} ${
                          quantityLabel || 'units'
                        } · ${row.total}${currency}`
                      : row.name
                  }
                >
                  <Text
                    fontSize="xs"
                    color="fg.muted"
                    textAlign="center"
                    truncate
                    maxW="full"
                    cursor="default"
                  >
                    {row.name}
                  </Text>
                </Tooltip>
              )}
            </VStack>
          );
        })}
      </HStack>
      {othersRow && (
        <Text
          fontSize="xs"
          color="fg.muted"
          textAlign="center"
          mt={1}
          className="hide-in-print"
        >
          {rest.length} more item{rest.length === 1 ? '' : 's'} in "Others" —
          click it to see the full breakdown
        </Text>
      )}
      <OverLay show={showAll} className="hide-in-print">
        <Box p={4}>
          <HStack justify="space-between" mb={3}>
            <Text fontWeight="semibold">All items</Text>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowAll(false)}
            >
              <Icon name="cancel" />
              Close
            </Button>
          </HStack>
          <RankedBarList
            rows={sorted}
            quantityLabel={quantityLabel}
            emptyMessage={emptyMessage}
            metric={metric}
          />
        </Box>
      </OverLay>
    </React.Fragment>
  );
};

export default TopItemsChart;
