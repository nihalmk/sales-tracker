/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import Select from 'react-select';

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
  noOptionsMessage?: string
  innerRef?: any
}

const SelectBox: React.FunctionComponent<Props> = (props) => {
  return (
    <>
      <div className={'form-group ' + (props.className || '')}>
        {props.selectLabel && (
          <label className="form-label">{props.selectLabel}</label>
        )}
        <Select
          className={
            'basic-single form-control form-control-without-padding ' +
            (props.isInvalid && 'is-invalid')
          }
          tabIndex={props.tabIndex ? props.tabIndex.toString() : undefined}
          classNamePrefix="select"
          value={props.selectDefault}
          isDisabled={props.isDisabled}
          isLoading={props.isLoading}
          isClearable={props.isClearable}
          isSearchable={props.isSearchable}
          name={props.name ? props.name : 'select'}
          options={props.selectData}
          onChange={props.onSelectChange}
          formatOptionLabel={props.customOption}
          noOptionsMessage={() => props.noOptionsMessage}
          ref={props.innerRef}
        />
      </div>
      <style jsx global>{`
        .error-message {
          display: none;
          width: 100%;
          margin-top: 0.25rem;
          font-size: 87.5%;
          color: #cd201f;
        }
        .basic-single.form-control.form-control-without-padding {
          padding: 0px;
          border-radius: 3px;
        }
        .basic-single.form-control.form-control-without-padding
          .select__control {
          border: none;
        }
        .is-invalid {
          border-color: #cd201f;
        }
        .select__control {
          border: none;
        }
        .select__indicator-separator {
          display: none;
        }
        .height-set {
          width: 230px;
        }
        .custom-select__placeholder {
          margin-top: 1px;
        }
        .custom-select__indicator.custom-select__clear-indicator {
          display: none;
        }
        .custom-select__control {
          border: none;
          width: auto !important;
        }
        .custom-select__indicator-separator {
          display: none;
        }
        .custom-select__value-container,
        .custom-select__menu,
        .select__menu,
        .select__value-container {
          text-transform: capitalize;
        }
        .select__single-value {
          color: #495057 !important;
        }
      `}</style>
    </>
  );
};

export default SelectBox;
