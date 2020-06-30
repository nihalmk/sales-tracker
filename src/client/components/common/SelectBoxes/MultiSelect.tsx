import React from 'react';
import Select from 'react-select';
import MultiValueComponent from './MultiValueComponent';
import { LabelValueObj } from './SelectBox';

interface Props {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onChange: any;
  options?: LabelValueObj[];
  data?: LabelValueObj | LabelValueObj[];
  selectLabel?: string;
  isInvalid?: boolean;
  formClass?: boolean;
  isDisabled?: boolean;
  className?: string;
  tabIndex?: string;
}
const MultiSelect: React.FC<Props> = ({
  onChange,
  options,
  data,
  selectLabel,
  isInvalid,
  formClass,
  isDisabled,
  tabIndex,
  className,
}) => {
  return (
    <>
      <div className={selectLabel && 'form-group'}>
        {selectLabel && (
          <label htmlFor={selectLabel} className="form-label">
            {selectLabel}
          </label>
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
          styles={{
            valueContainer: (styles, {}) => {
              return {
                ...styles,
                height: 25,
                overflow: 'hidden',
                whiteSpace: 'nowrap',
                textOverflow: 'ellipsis',
                display: 'block',
              };
            },
          }}
          className={
            'height-set ' +
            ((formClass && 'form-control form-control-without-padding ') ||
              '') +
            ((isInvalid && 'is-invalid ') || '') +
            (className || '')
          }
        />
        {isInvalid && (
          <div className="invalid-feedback">
            Please select one {selectLabel} option
          </div>
        )}
        <style jsx global>
          {`
            .custom-select__control {
              border: 1px solid #0028641f;
              border-radius: 4px !important;
              border-style: solid !important;
              border-width: 1px !important;
            }
            .custom-select__placeholder {
              margin-top: 2px;
            }
            .custom-select__indicator.custom-select__clear-indicator {
              display: none;
            }
            .height-set.form-control.form-control-without-padding {
              padding: 1px;
              border-radius: 5px;
              width: 100%;
            }
          `}
        </style>
      </div>
    </>
  );
};

export default MultiSelect;
