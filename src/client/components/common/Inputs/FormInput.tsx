import React, { SyntheticEvent } from 'react';
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import { IconProp } from '@fortawesome/fontawesome-svg-core';

interface Props {
  inputLabel?: string;
  inputName: string;
  inputType: string;
  placeholderValue?: string;
  isInvalid?: boolean;
  tabIndex?: number;
  autoComplete?: string;
  value?: string | number;
  disabled?: boolean;
  onChange: (e: SyntheticEvent<Element, Event>) => void;
  min?: number;
  max?: number;
  step?: number;
  className?: string;
  prependIcon?: any;
  autoFocus?: boolean;
  append?: string;
}

const Input: React.FunctionComponent<Props> = (props) => (
  <div className="form-group">
    {props.inputLabel && (
      <label className="form-label">{props.inputLabel}</label>
    )}
    <div className={props.prependIcon ? 'input-group' : ''}>
      {props.prependIcon && (
        <span className="input-group-prepend">
          <span className="input-group-text">
            {/* <FontAwesomeIcon
              icon={props.prependIcon}
              style={{ color: '#9aa0ac' }}
            ></FontAwesomeIcon> */}
          </span>
        </span>
      )}

      <input
        autoComplete={
          props.inputType === 'password'
            ? 'new-password'
            : props.autoComplete || 'off'
        }
        tabIndex={props.tabIndex}
        type={props.inputType}
        name={props.inputName}
        className={
          'form-control ' +
          (props.isInvalid ? 'is-invalid ' : '') +
          'pt-678 ' +
          props.className
        }
        placeholder={props.placeholderValue}
        onChange={props.onChange}
        value={props.value}
        disabled={props.disabled}
        minLength={props.min}
        maxLength={props.max}
        step={props.step}
        autoFocus={props.autoFocus}
      />
      {props.append && (
        <span className="input-group-append">
          <span className="input-group-text">{props.append}</span>
        </span>
      )}
    </div>
    <style jsx>{`
      .form-control {
        line-height: 1.75;
      }
    `}</style>
  </div>
);

export default Input;
