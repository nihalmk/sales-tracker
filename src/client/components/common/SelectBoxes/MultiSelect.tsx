import React from 'react';
import Select from 'react-select';
import { Field } from '@chakra-ui/react';
import MultiValueComponent from './MultiValueComponent';
import { LabelValueObj } from './SelectBox';
import { brandSelectStyles } from './selectStyles';

interface Props {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onChange: any;
  options?: LabelValueObj[];
  data?: LabelValueObj | LabelValueObj[];
  selectLabel?: string;
  isInvalid?: boolean;
  isDisabled?: boolean;
  className?: string;
  tabIndex?: number;
}
const MultiSelect: React.FC<Props> = ({
  onChange,
  options,
  data,
  selectLabel,
  isInvalid,
  isDisabled,
  tabIndex,
  className,
}) => {
  return (
    <Field.Root invalid={isInvalid} className={className}>
      {selectLabel && (
        // @ts-expect-error Chakra v3's Ark UI-derived FieldLabelProps doesn't model `children` in its polymorphic types, though it renders them fine.
        <Field.Label htmlFor={selectLabel}>{selectLabel}</Field.Label>
      )}
      <Select
        tabIndex={tabIndex}
        options={options}
        isMulti
        id={selectLabel}
        isSearchable={false}
        onChange={onChange}
        hideSelectedOptions={false}
        value={data}
        isDisabled={isDisabled}
        classNamePrefix="custom-select"
        components={{ MultiValueContainer: MultiValueComponent }}
        menuPortalTarget={
          typeof document !== 'undefined' ? document.body : undefined
        }
        styles={{
          ...brandSelectStyles(isInvalid),
          valueContainer: (styles) => ({
            ...styles,
            height: 25,
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis',
            display: 'block',
          }),
        }}
      />
      {isInvalid && (
        // @ts-expect-error Chakra v3's Ark UI-derived FieldErrorTextProps doesn't model `children` in its polymorphic types, though it renders them fine.
        <Field.ErrorText>
          Please select one {selectLabel} option
        </Field.ErrorText>
      )}
    </Field.Root>
  );
};

export default MultiSelect;
