/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import Select from 'react-select';
import { Field } from '@chakra-ui/react';
import { brandSelectStyles } from './selectStyles';

export class LabelValueObj {
  label!: string;
  value!: string;
}

export class LabelValueBoolObj {
  label!: string;
  value!: boolean;
}

interface Props {
  selectLabel?: string;
  isLoading?: boolean;
  isDisabled?: boolean;
  selectData: LabelValueObj[] | LabelValueBoolObj[];
  isClearable?: boolean;
  isSearchable?: boolean;
  onSelectChange: any;
  isInvalid?: boolean;
  selectDefault?: LabelValueObj | LabelValueBoolObj;
  tabIndex?: number;
  name?: string;
  customOption?: (val: LabelValueObj) => React.ReactElement | null;
  className?: string;
  noOptionsMessage?: string;
  innerRef?: any;
  placeholder?: string;
  onInputChange?: (value: string) => void;
}

const SelectBox: React.FunctionComponent<Props> = (props) => {
  return (
    <Field.Root invalid={props.isInvalid} className={props.className}>
      {props.selectLabel && (
        // @ts-expect-error Chakra v3's Ark UI-derived FieldLabelProps doesn't model `children` in its polymorphic types, though it renders them fine.
        <Field.Label>{props.selectLabel}</Field.Label>
      )}
      <Select
        tabIndex={props.tabIndex}
        classNamePrefix="select"
        value={props.selectDefault}
        isDisabled={props.isDisabled}
        isLoading={props.isLoading}
        isClearable={props.isClearable}
        isSearchable={props.isSearchable}
        name={props.name ? props.name : 'select'}
        options={props.selectData}
        onChange={props.onSelectChange}
        onInputChange={props.onInputChange}
        formatOptionLabel={props.customOption}
        noOptionsMessage={() => props.noOptionsMessage}
        placeholder={props.placeholder}
        ref={props.innerRef}
        styles={brandSelectStyles(props.isInvalid)}
      />
    </Field.Root>
  );
};

export default SelectBox;
