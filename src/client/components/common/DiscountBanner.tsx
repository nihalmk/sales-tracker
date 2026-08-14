import React from 'react';
import { Box, HStack, VStack, Text } from '@chakra-ui/react';
import _ from 'lodash';

// Small inline icons for the banner — styled via `currentColor` so they
// inherit the wrapping Box's `color`.
const TagIcon: React.FC<{ size?: number }> = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path
      d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="7.5" cy="7.5" r="1.5" fill="currentColor" />
  </svg>
);

const PercentIcon: React.FC<{ size?: number }> = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <line
      x1="19"
      y1="5"
      x2="5"
      y2="19"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <circle cx="6.5" cy="6.5" r="2.5" stroke="currentColor" strokeWidth="2" />
    <circle cx="17.5" cy="17.5" r="2.5" stroke="currentColor" strokeWidth="2" />
  </svg>
);

export interface DiscountLineItem {
  id: string;
  name: string;
  mrp: number;
  salePrice: number;
  quantity: number;
}

export interface DiscountedLineItem extends DiscountLineItem {
  discountPercent: number;
  discountTotal: number;
}

// MRP vs sale price, per line item — only items actually sold below MRP
// count as a discount. Exported so callers can show the aggregate (e.g. in
// a totals row) without duplicating this math.
export const calculateDiscounts = (
  items: DiscountLineItem[],
): {
  discountedItems: DiscountedLineItem[];
  totalDiscount: number;
  totalDiscountPercent: number;
} => {
  const discountedItems = _.compact(
    items?.map((item) => {
      const discountPerUnit = item.mrp - item.salePrice;
      if (discountPerUnit <= 0) {
        return null;
      }
      return {
        ...item,
        discountPercent: Math.round((discountPerUnit / item.mrp) * 100),
        discountTotal: discountPerUnit * item.quantity,
      };
    }),
  );
  const totalDiscount = _.sum(discountedItems.map((d) => d.discountTotal));
  // Overall % is against total MRP across ALL items (not just discounted
  // ones), so it reflects the discount rate on the whole bill.
  const totalMrp = _.sum(items?.map((item) => item.mrp * item.quantity));
  const totalDiscountPercent = totalMrp
    ? Math.round((totalDiscount / totalMrp) * 100)
    : 0;
  return { discountedItems, totalDiscount, totalDiscountPercent };
};

interface Props {
  items: DiscountLineItem[];
}

// Discount summary banner — used wherever a list of priced items should
// surface savings (e.g. the Add Sale item table).
const DiscountBanner: React.FC<Props> = ({ items }) => {
  if (!items?.length) {
    return null;
  }

  const { discountedItems, totalDiscount, totalDiscountPercent } =
    calculateDiscounts(items);

  return (
    <Box
      borderRadius="l3"
      borderWidth="1px"
      borderColor={totalDiscount ? 'green.200' : 'border'}
      bg={totalDiscount ? 'green.50' : 'bg.subtle'}
      p={4}
    >
      <HStack justify="space-between">
        <HStack gap={2}>
          <Box color={totalDiscount ? 'green.600' : 'fg.muted'}>
            <TagIcon size={20} />
          </Box>
          <Text
            fontWeight="semibold"
            color={totalDiscount ? 'green.700' : 'fg.muted'}
          >
            {totalDiscount ? 'Discounts Applied' : 'No Discounts'}
          </Text>
        </HStack>
        {!!totalDiscount && (
          <HStack gap={2}>
            <Text fontWeight="bold" color="green.700" fontSize="lg">
              Saved {totalDiscount}₹
            </Text>
            <Text
              color="green.700"
              bg="green.100"
              px={2}
              borderRadius="full"
              fontSize="xs"
              fontWeight="semibold"
            >
              {totalDiscountPercent}% off
            </Text>
          </HStack>
        )}
      </HStack>
      {!!discountedItems.length && (
        <VStack align="stretch" gap={2} mt={3}>
          {discountedItems.map((d) => (
            <HStack key={d.id} justify="space-between" fontSize="sm">
              <HStack gap={2}>
                <Box color="green.500">
                  <PercentIcon size={14} />
                </Box>
                <Text color="fg">{d.name}</Text>
                <Text color="fg.muted">
                  {d.mrp}₹ → {d.salePrice}₹
                </Text>
                <Text
                  color="green.700"
                  bg="green.100"
                  px={2}
                  borderRadius="full"
                  fontSize="xs"
                  fontWeight="semibold"
                >
                  {d.discountPercent}% off
                </Text>
              </HStack>
              <Text fontWeight="medium" color="green.600">
                −{d.discountTotal}₹
              </Text>
            </HStack>
          ))}
        </VStack>
      )}
    </Box>
  );
};

export default DiscountBanner;
