import React from 'react';
import { Box, HStack, Text, VStack } from '@chakra-ui/react';
import { currency } from '../../utils/helpers';
import { ChartMetric, GroupedRow } from '../Report/aggregate';

interface Props {
  rows: GroupedRow[];
  // e.g. "sold" / "bought" — omitted entirely for rows with no quantity
  // (spent/received have none, only an amount).
  quantityLabel?: string;
  emptyMessage: string;
  // Which number ranks the list and sizes the bars — defaults to money,
  // since that's meaningful for every section (spent/received have no
  // quantity to switch to).
  metric?: ChartMetric;
}

// A dependency-free "bar chart" — a ranked list where each row's bar width
// is proportional to its share of the largest value in the set. Good
// enough to answer "what did we sell/spend the most on" without pulling in
// a charting library for what's fundamentally one series of bars.
const RankedBarList: React.FC<Props> = ({
  rows,
  quantityLabel,
  emptyMessage,
  metric = 'total',
}) => {
  const valueOf = (row: GroupedRow) =>
    metric === 'quantity' ? row.quantity || 0 : row.total;
  const sorted = [...rows].sort((a, b) => valueOf(b) - valueOf(a));
  const maxValue = Math.max(...sorted.map(valueOf), 1);

  if (sorted.length === 0) {
    return (
      <Text textAlign="center" py={8} color="fg.muted" fontSize="sm">
        {emptyMessage}
      </Text>
    );
  }

  return (
    <VStack align="stretch" gap={4}>
      {sorted.map((row) => (
        <Box key={row.name}>
          <HStack justify="space-between" mb={1} gap={3}>
            <Text fontWeight="medium" fontSize="sm" truncate>
              {row.name}
            </Text>
            <Text fontSize="sm" color="fg.muted" flexShrink={0}>
              {metric === 'quantity' ? (
                <React.Fragment>
                  {row.total}
                  {currency} ·{' '}
                  <Text as="span" fontWeight="semibold" color="fg">
                    {row.quantity} {quantityLabel || 'units'}
                  </Text>
                </React.Fragment>
              ) : (
                <React.Fragment>
                  {row.quantity !== undefined &&
                    `${row.quantity} ${quantityLabel || 'units'} · `}
                  <Text as="span" fontWeight="semibold" color="fg">
                    {row.total}
                    {currency}
                  </Text>
                </React.Fragment>
              )}
            </Text>
          </HStack>
          <Box bg="bg.muted" borderRadius="full" h="10px" overflow="hidden">
            <Box
              bg="brand.solid"
              h="full"
              borderRadius="full"
              width={`${(valueOf(row) / maxValue) * 100}%`}
              transition="width 0.3s"
            />
          </Box>
        </Box>
      ))}
    </VStack>
  );
};

export default RankedBarList;
