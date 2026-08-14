import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ApolloError,
  DocumentNode,
  OperationVariables,
  useQuery,
} from '@apollo/client';

interface Options<TData, TItem, TExtra, TVariables extends OperationVariables> {
  query: DocumentNode;
  // Filter variables only — page/limit are managed internally.
  variables: TVariables;
  pageSize: number;
  getItems: (data: TData) => TItem[];
  getTotalCount: (data: TData) => number;
  // Aggregates returned alongside the list (e.g. totalAmount) that are
  // computed over the whole filtered set, not just the current page.
  getExtra?: (data: TData) => TExtra;
  skip?: boolean;
}

interface Result<TItem, TExtra> {
  items: TItem[];
  extra: TExtra | undefined;
  loading: boolean;
  loadingMore: boolean;
  error: ApolloError | Error | undefined;
  hasMore: boolean;
  totalCount: number;
  retry: () => void;
  refresh: () => void;
  // Ref callback for a sentinel element placed after the list — loads the
  // next page when it scrolls into view.
  sentinelRef: (node: HTMLDivElement | null) => void;
}

// Generic Apollo-backed infinite scroll: fetches page 1 via `useQuery`, then
// subsequent pages via `fetchMore`, appending results as a sentinel element
// scrolls into view. Resets to page 1 whenever `variables` changes (e.g. a
// filter or search term).
export function useInfiniteScroll<
  TData = any,
  TItem = any,
  TExtra = undefined,
  TVariables extends OperationVariables = OperationVariables,
>({
  query,
  variables,
  pageSize,
  getItems,
  getTotalCount,
  getExtra,
  skip,
}: Options<TData, TItem, TExtra, TVariables>): Result<TItem, TExtra> {
  const [items, setItems] = useState<TItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [extra, setExtra] = useState<TExtra>();
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadMoreError, setLoadMoreError] = useState<Error>();
  const pageRef = useRef(1);
  const variablesKey = JSON.stringify(variables);

  const { loading, error, data, fetchMore, refetch } = useQuery<TData>(query, {
    variables: { ...variables, page: 1, limit: pageSize } as TVariables,
    fetchPolicy: 'no-cache',
    skip,
  });

  // A filter/search change gives the query above new variables, which
  // triggers its own page-1 refetch — clear stale results immediately
  // rather than waiting on the round-trip.
  useEffect(() => {
    setItems([]);
    setTotalCount(0);
    setLoadMoreError(undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [variablesKey]);

  // `data` only ever changes from a page-1 response (initial load, a filter
  // change, or an explicit refetch) — fetchMore results are handled by hand
  // in loadMore below, not through this reactive `data`. So it's always
  // correct to reset pagination bookkeeping here too.
  useEffect(() => {
    if (!data) {
      return;
    }
    pageRef.current = 1;
    setItems(getItems(data));
    setTotalCount(getTotalCount(data));
    setExtra(getExtra?.(data));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  const loadMore = useCallback(async () => {
    if (loading || loadingMore || items.length >= totalCount) {
      return;
    }
    const nextPage = pageRef.current + 1;
    setLoadingMore(true);
    setLoadMoreError(undefined);
    try {
      const { data: moreData } = await fetchMore({
        variables: {
          ...variables,
          page: nextPage,
          limit: pageSize,
        } as TVariables,
        // The base query uses fetchPolicy 'no-cache', which requires an
        // updateQuery callback (Apollo throws otherwise). We merge pages by
        // hand below via the resolved promise data, so this just has to
        // return a referentially-stable value — returning `previous`
        // unchanged means Apollo's own reactive `data` doesn't shift under
        // us as a side effect of this call.
        updateQuery: (previous) => previous,
      });
      pageRef.current = nextPage;
      setItems((current) => [...current, ...getItems(moreData)]);
      setTotalCount(getTotalCount(moreData));
      setExtra(getExtra?.(moreData));
    } catch (e) {
      setLoadMoreError(e as Error);
    } finally {
      setLoadingMore(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchMore, loading, loadingMore, items.length, totalCount, variablesKey]);

  // Kept in refs so the single IntersectionObserver instance below always
  // acts on fresh state without needing to be torn down and recreated.
  const canAutoLoadRef = useRef(false);
  canAutoLoadRef.current =
    !loading &&
    !loadingMore &&
    !loadMoreError &&
    !error &&
    items.length < totalCount;
  const loadMoreRef = useRef(loadMore);
  loadMoreRef.current = loadMore;

  const observerRef = useRef<IntersectionObserver | undefined>(undefined);
  const sentinelRef = useCallback((node: HTMLDivElement | null) => {
    observerRef.current?.disconnect();
    if (!node) {
      return;
    }
    observerRef.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && canAutoLoadRef.current) {
        loadMoreRef.current();
      }
    });
    observerRef.current.observe(node);
  }, []);

  useEffect(() => () => observerRef.current?.disconnect(), []);

  const retry = useCallback(() => {
    if (loadMoreError) {
      loadMore();
    } else {
      refetch();
    }
  }, [loadMoreError, loadMore, refetch]);

  // Distinct from `retry` (error recovery): call after a mutation elsewhere
  // (e.g. creating an item) to reload page 1 with the freshest data.
  const refresh = useCallback(() => refetch(), [refetch]);

  return {
    items,
    extra,
    loading,
    loadingMore,
    error: error || loadMoreError,
    hasMore: items.length < totalCount,
    totalCount,
    retry,
    refresh,
    sentinelRef,
  };
}

export default useInfiniteScroll;
