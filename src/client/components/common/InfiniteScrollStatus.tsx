import React from 'react';
import { Box, Button, HStack, Spinner, Text, VStack } from '@chakra-ui/react';

interface Props {
  loadingMore: boolean;
  error: unknown;
  hasMore: boolean;
  itemsCount: number;
  totalCount: number;
  onRetry: () => void;
  // Ref callback from useInfiniteScroll — placed on the sentinel element so
  // the hook can detect when it scrolls into view.
  sentinelRef: (node: HTMLDivElement | null) => void;
  itemLabel?: string;
}

// Footer status for an infinite-scroll list: a scroll sentinel plus loading /
// error / end-of-list states. Pairs with useInfiniteScroll.
const InfiniteScrollStatus: React.FC<Props> = ({
  loadingMore,
  error,
  hasMore,
  itemsCount,
  totalCount,
  onRetry,
  sentinelRef,
  itemLabel = 'items',
}) => {
  if (!itemsCount) {
    return null;
  }

  if (error) {
    return (
      <VStack py={4} gap={2} className="hide-in-print">
        <Text color="red.600" fontSize="sm">
          Failed to load more {itemLabel}.
        </Text>
        <Button
          size="sm"
          colorPalette="red"
          variant="outline"
          onClick={onRetry}
        >
          Retry
        </Button>
      </VStack>
    );
  }

  return (
    <Box ref={sentinelRef} py={4} textAlign="center" className="hide-in-print">
      {loadingMore ? (
        <HStack justify="center" gap={2}>
          <Spinner size="sm" color="brand.600" />
          <Text fontSize="sm" color="fg.muted">
            Loading more… ({totalCount - itemsCount} remaining)
          </Text>
        </HStack>
      ) : hasMore ? (
        <Text fontSize="xs" color="fg.subtle">
          Scroll for more
        </Text>
      ) : (
        <Text fontSize="sm" color="fg.muted" fontWeight="medium">
          All {itemLabel} listed
        </Text>
      )}
    </Box>
  );
};

export default InfiniteScrollStatus;
