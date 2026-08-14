import React, { useEffect, useState } from 'react';
import CreatableSelect from './CreatableSelect';
import { LabelValueObj } from './SelectBox';

interface Props {
  label: string;
  placeholder?: string;
  tabIndex?: number;
  categories: string[];
  // The current value from the caller's form state — kept in sync so a
  // programmatic reset (going back to empty) or a resumed value (e.g. a
  // draft) both display correctly, not just user-driven selection.
  value?: string;
  onSelect: (value: string | null) => void;
  isInvalid?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  innerRef?: any;
}

/**
 * A creatable, searchable select for picking a previously-used plain-text
 * category (e.g. a "Spent On"/"Received For" label) or typing a new one
 * that doesn't match any existing entry yet.
 */
const CategorySelect: React.FC<Props> = ({
  label,
  placeholder,
  tabIndex,
  categories,
  value,
  onSelect,
  isInvalid,
  innerRef,
}) => {
  const options: LabelValueObj[] = categories.map((c) => ({
    label: c,
    value: c,
  }));

  const [selected, setSelected] = useState<LabelValueObj | null>(null);

  useEffect(() => {
    if (!value) {
      if (selected) {
        setSelected(null);
      }
      return;
    }
    if (selected?.value === value) {
      return;
    }
    setSelected({ label: value, value });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const handleChange = (picked: LabelValueObj | null) => {
    setSelected(picked);
    onSelect(picked?.value || null);
  };

  return (
    <CreatableSelect
      tabIndex={tabIndex}
      selectLabel={label}
      options={options}
      onChange={handleChange}
      placeholder={placeholder}
      value={selected}
      isClearable
      isInvalid={isInvalid}
      innerRef={innerRef}
    />
  );
};

export default CategorySelect;
