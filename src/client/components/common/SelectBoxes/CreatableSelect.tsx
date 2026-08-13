import React from 'react';
import SelectBox from 'react-select/creatable';
import { Field } from '@chakra-ui/react';
import { LabelValueObj } from './SelectBox';
import { brandSelectStyles } from './selectStyles';

interface Props {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onChange: any;
  options: LabelValueObj[];
  selectLabel?: string;
  isInvalid?: boolean;
  formClass?: boolean;
  isDisabled?: boolean;
  value?: LabelValueObj | null;
  isMulti?: boolean;
  tabIndex?: number;
  customOption?: (val: LabelValueObj) => React.ReactElement | null;
  placeholder?: string;
}
const CreatableSelect: React.FC<Props> = ({
  onChange,
  options,
  selectLabel,
  isInvalid,
  isDisabled,
  value,
  isMulti,
  tabIndex,
  customOption,
  placeholder,
}) => {
  return (
    <Field.Root invalid={isInvalid}>
      {selectLabel && (
        // @ts-expect-error Chakra v3's Ark UI-derived FieldLabelProps doesn't model `children` in its polymorphic types, though it renders them fine.
        <Field.Label>{selectLabel}</Field.Label>
      )}
      <SelectBox
        tabIndex={tabIndex}
        options={options}
        isMulti={isMulti}
        onChange={onChange}
        value={value}
        isDisabled={isDisabled}
        classNamePrefix="select"
        formatOptionLabel={customOption}
        placeholder={placeholder}
        styles={brandSelectStyles(isInvalid)}
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

export default CreatableSelect;
