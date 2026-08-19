import { useEffect, useRef, useState } from 'react';

interface Options {
  count: number;
  gap?: number;
  // Width reserved for the "More" trigger itself, only subtracted while
  // there's still at least one item left over to put inside it.
  moreWidth?: number;
}

interface Result {
  containerRef: (node: HTMLDivElement | null) => void;
  // Attach to the Nth hidden measurement item so its real rendered width
  // (font, padding, content all included) can be read off the DOM.
  measureRef: (index: number) => (node: HTMLElement | null) => void;
  visibleCount: number;
}

// Figures out how many of `count` same-row items fit inside their
// container's current width, re-measuring on resize. Item widths are read
// from a parallel set of DOM nodes (rendered off-screen, one per item, via
// measureRef) rather than the visible ones, so the answer doesn't depend
// on how many are currently shown.
export function useOverflowNav({ count, gap = 8, moreWidth = 90 }: Options): Result {
  const containerElRef = useRef<HTMLDivElement | null>(null);
  const measureElsRef = useRef<(HTMLElement | null)[]>([]);
  const [visibleCount, setVisibleCount] = useState(count);

  useEffect(() => {
    const container = containerElRef.current;
    if (!container) {
      return;
    }

    const recalc = () => {
      const containerWidth = container.offsetWidth;
      if (!containerWidth) {
        return;
      }
      let total = 0;
      let fit = 0;
      for (let i = 0; i < count; i++) {
        const el = measureElsRef.current[i];
        const itemWidth = el?.offsetWidth || 0;
        const withGap = itemWidth + (i > 0 ? gap : 0);
        const itemsLeftAfterThis = count - (i + 1);
        const reserve = itemsLeftAfterThis > 0 ? moreWidth + gap : 0;
        if (total + withGap + reserve > containerWidth) {
          break;
        }
        total += withGap;
        fit++;
      }
      setVisibleCount(fit);
    };

    recalc();
    const observer = new ResizeObserver(recalc);
    observer.observe(container);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count, gap, moreWidth]);

  return {
    containerRef: (node) => {
      containerElRef.current = node;
    },
    measureRef: (index) => (node) => {
      measureElsRef.current[index] = node;
    },
    visibleCount,
  };
}
