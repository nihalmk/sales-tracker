import React from 'react';
import CreatableSelect from 'react-select/creatable';
import { LabelValueObj } from './SelectBox';

interface Props {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onChange: any;
  options: LabelValueObj[];
  selectLabel?: string;
  isInvalid?: boolean;
  formClass?: boolean;
  isDisabled?: boolean;
  value?: LabelValueObj[];
}
const CreatableMultiSelect: React.FC<Props> = ({
  onChange,
  options,
  selectLabel,
  isInvalid,
  isDisabled,
  formClass,
  value,
}) => {
  return (
    <>
      <div className={selectLabel && 'form-group'}>
        {selectLabel && <label className="form-label">{selectLabel}</label>}
        <CreatableSelect
          options={options}
          isMulti
          onChange={onChange}
          value={value}
          isDisabled={isDisabled}
          classNamePrefix="select"
          className={`multi-select ${
            ((formClass && 'form-control form-control-without-padding ') ||
              '') + (isInvalid && 'is-invalid')
          }`}
        />
        {isInvalid && (
          <div className="invalid-feedback">
            Please select one {selectLabel} option
          </div>
        )}
        <style jsx global>{`
          .form-control-without-padding {
            padding: 0;
          }
          .multi-select {
            border: 1px solid #0028641f !important;
            border-radius: 5px;
          }
          .select__multi-value .select__multi-value__label {
            line-height: 18px;
            height: 22px;
            text-transform: none;
          }
        `}</style>
      </div>
    </>
  );
};

export default CreatableMultiSelect;
