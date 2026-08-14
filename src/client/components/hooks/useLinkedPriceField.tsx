import { useCallback, useState } from 'react';

interface Result {
  manuallySet: boolean;
  // Call from the dependent field's (e.g. Sale Price) onChange with the raw
  // input string — marks it as manually edited unless cleared back to empty.
  onDependentChange: (raw: string) => void;
  // Given the dependent field's current value and the new source value (e.g.
  // MRP), returns what the dependent field should become.
  nextDependentValue: (currentValue: number, newSourceValue: number) => number;
  reset: () => void;
}

// Keeps a "dependent" price field (e.g. Sale Price) mirroring a "source"
// field (e.g. MRP) on every keystroke until the user types into the
// dependent field directly — matching the Stock add-item form's MRP → Sale
// Price auto-fill behavior. Extracted so other forms with the same pattern
// (e.g. Add Purchase) don't duplicate the state/logic.
export function useLinkedPriceField(): Result {
  const [manuallySet, setManuallySet] = useState(false);

  const onDependentChange = useCallback((raw: string) => {
    setManuallySet(raw !== '');
  }, []);

  const nextDependentValue = useCallback(
    (currentValue: number, newSourceValue: number) =>
      manuallySet ? currentValue : newSourceValue,
    [manuallySet],
  );

  const reset = useCallback(() => setManuallySet(false), []);

  return { manuallySet, onDependentChange, nextDependentValue, reset };
}

export default useLinkedPriceField;
