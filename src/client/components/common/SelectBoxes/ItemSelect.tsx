import React, { useEffect, useState } from 'react';
import { useQuery } from '@apollo/client';
import { GET_ITEMS } from '../../../graphql/query/items';
import SelectBox, { LabelValueObj } from './SelectBox';

const SEARCH_DEBOUNCE_MS = 1000;
const RESULT_LIMIT = 20;

interface Props {
  label: string;
  placeholder?: string;
  tabIndex?: number;
  // The current item name from the caller's form state — only used to
  // notice a full form reset (going back to empty) and clear the internal
  // selection; every other change round-trips through onSelect below.
  value?: string;
  onSelect: (itemName: string | null) => void;
}

/**
 * A searchable select that queries the shop's items as you type (debounced),
 * rather than loading the whole catalog upfront. Since a product name can
 * map to several Items docs over time (a new one is created whenever
 * purchase cost changes), results are de-duplicated by name and onSelect
 * only ever returns a name — callers should filter by name, not item id.
 */
const ItemSelect: React.FC<Props> = ({
  label,
  placeholder,
  tabIndex,
  value,
  onSelect,
}) => {
  const [inputValue, setInputValue] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selected, setSelected] = useState<LabelValueObj | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(inputValue);
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [inputValue]);

  useEffect(() => {
    if (!value) {
      setSelected(null);
    }
  }, [value]);

  const { data, loading } = useQuery(GET_ITEMS, {
    variables: { search: debouncedSearch || undefined, limit: RESULT_LIMIT },
    fetchPolicy: 'no-cache',
  });

  // Apollo's `loading` only covers the network round-trip, which starts
  // *after* the debounce timer fires — without this, the indicator would
  // stay off for the full second of debounce right after each keystroke.
  const isSearching = inputValue !== debouncedSearch || loading;

  const seenNames = new Set<string>(selected ? [selected.value] : []);
  const fetchedOptions: LabelValueObj[] = (data?.getItemsForUser?.items || [])
    .filter((item: { name: string }) => {
      if (seenNames.has(item.name)) return false;
      seenNames.add(item.name);
      return true;
    })
    .map((item: { name: string }) => ({ label: item.name, value: item.name }));

  // Pin the current selection to the top regardless of what the active
  // search matches — otherwise reopening the dropdown after picking an item
  // that isn't among the current results makes it look like it disappeared.
  const options: LabelValueObj[] = selected
    ? [selected, ...fetchedOptions]
    : fetchedOptions;

  return (
    <SelectBox
      tabIndex={tabIndex}
      selectLabel={label}
      placeholder={placeholder}
      selectData={options}
      selectDefault={selected}
      isLoading={isSearching}
      isClearable
      isSearchable
      noOptionsMessage="No items found"
      onInputChange={setInputValue}
      onSelectChange={(picked: LabelValueObj | null) => {
        setSelected(picked);
        onSelect(picked?.value || null);
      }}
    />
  );
};

export default ItemSelect;
