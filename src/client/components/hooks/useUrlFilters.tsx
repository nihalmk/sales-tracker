import { useCallback } from 'react';
import { useRouter } from 'next/router';

// Reads/writes filter values in the URL's query string — merged with
// whatever other params are already there (other pages' own filters, a
// print flag, etc.) rather than replacing the whole query — so a page
// reload doesn't reset a filter back to blank.
//
// `router.query` is empty on the very first render (before Next hydrates
// the router), so callers must gate their "read from the URL" effect on
// `isReady`, not just read `params` at mount time.
export function useUrlFilters() {
  const router = useRouter();

  const params: Record<string, string> = {};
  for (const [key, value] of Object.entries(router.query)) {
    if (typeof value === 'string') {
      params[key] = value;
    } else if (Array.isArray(value) && value[0]) {
      params[key] = value[0];
    }
  }

  const setParams = useCallback(
    (updates: Record<string, string | undefined>) => {
      const query: Record<string, string> = {
        ...(router.query as Record<string, string>),
      };
      let changed = false;
      for (const [key, value] of Object.entries(updates)) {
        if (value) {
          if (query[key] !== value) {
            query[key] = value;
            changed = true;
          }
        } else if (key in query) {
          delete query[key];
          changed = true;
        }
      }
      if (changed) {
        router.replace({ pathname: router.pathname, query }, undefined, {
          shallow: true,
        });
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [router],
  );

  return { params, isReady: router.isReady, setParams };
}

export default useUrlFilters;
