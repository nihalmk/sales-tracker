import React, { useEffect, useState } from 'react';
import { Box, Text } from '@chakra-ui/react';
import CreatableSelect from './CreatableSelect';
import { LabelValueObj } from './SelectBox';

export interface ContactEntity {
  name: string;
  contact?: string;
  email?: string;
}

interface ContactOption extends LabelValueObj {
  name: string;
  contact?: string;
  email?: string;
}

interface Props {
  label: string;
  placeholder?: string;
  tabIndex?: number;
  entities: ContactEntity[];
  // The current name from the caller's form state — only used to notice a
  // full form reset (going back to empty) and clear the internal selection;
  // every other change round-trips through onSelect below.
  value?: string;
  onSelect: (entity: (ContactEntity & { isNew?: boolean }) | null) => void;
}

/**
 * A creatable, searchable select for picking a previously-used contact
 * (customer, vendor, etc.) by name, showing their contact/email in the
 * dropdown to disambiguate entries that share a name, or typing a new name
 * that doesn't match any existing entity.
 */
const ContactSelect: React.FC<Props> = ({
  label,
  placeholder,
  tabIndex,
  entities,
  value,
  onSelect,
}) => {
  // entities can include several rows sharing the same name (unique per
  // name+contact+email), so `value` must be a composite key — the name
  // alone isn't unique enough for react-select to tell options apart.
  const options: ContactOption[] = entities.map((e) => ({
    label: e.name,
    value: `${e.name}__${e.contact || ''}__${e.email || ''}`,
    name: e.name,
    contact: e.contact,
    email: e.email,
  }));

  const [selected, setSelected] = useState<ContactOption | null>(null);

  // Sync from the caller's `value` (e.g. restored from a URL param) — not
  // just when it goes back to empty. `entities` is a query result that can
  // still be loading when this first runs, so fall back to a bare
  // name-only option rather than waiting; once entities are supplied,
  // `currentName === value` already holds and we leave it as-is.
  const currentName = selected ? selected.name || selected.value : undefined;
  useEffect(() => {
    if (!value) {
      if (selected) {
        setSelected(null);
      }
      return;
    }
    if (currentName === value) {
      return;
    }
    const match = entities.find((e) => e.name === value);
    setSelected(
      match
        ? {
            label: match.name,
            value: `${match.name}__${match.contact || ''}__${match.email || ''}`,
            name: match.name,
            contact: match.contact,
            email: match.email,
          }
        : { label: value, value, name: value },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, entities]);

  const handleChange = (
    picked: (ContactOption & { __isNew__?: boolean }) | null,
  ) => {
    setSelected(picked);
    if (!picked) {
      onSelect(null);
      return;
    }
    // A brand new name typed via CreatableSelect (no matching entity) — the
    // caller should leave contact/email as the user already entered them.
    if (picked.__isNew__) {
      onSelect({ name: picked.value, isNew: true });
      return;
    }
    onSelect({
      name: picked.name,
      contact: picked.contact,
      email: picked.email,
    });
  };

  const renderOption = (
    option: ContactOption,
    meta?: { context?: 'menu' | 'value' },
  ) => {
    // formatOptionLabel renders both the open dropdown's rows AND the closed
    // control's current-value display — only the former ever sits on the
    // dark "selected" background, so only it should go white; and the
    // contact/email subtext (there only to disambiguate same-named entries
    // while picking one) only makes sense in the open list.
    const isMenu = meta?.context === 'menu';
    const isHighlighted = isMenu && selected?.value === option.value;
    return (
      <Box>
        <Text color={isHighlighted ? 'white' : undefined}>{option.label}</Text>
        {isMenu && (option.contact || option.email) && (
          <Text
            fontSize="xs"
            color={isHighlighted ? 'whiteAlpha.800' : 'fg.muted'}
          >
            {[option.contact, option.email].filter(Boolean).join(' · ')}
          </Text>
        )}
      </Box>
    );
  };

  return (
    <CreatableSelect
      tabIndex={tabIndex}
      selectLabel={label}
      options={options}
      customOption={renderOption}
      onChange={handleChange}
      placeholder={placeholder}
      value={selected}
      isClearable
    />
  );
};

export default ContactSelect;
