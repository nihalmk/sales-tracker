import React, { SyntheticEvent } from 'react';
import { Field, Input as ChakraInput, InputGroup } from '@chakra-ui/react';

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
  innerRef?: any;
}

const Input: React.FunctionComponent<Props> = (props) => (
  <Field.Root invalid={props.isInvalid}>
    {props.inputLabel && (
      // @ts-expect-error Chakra v3's Ark UI-derived FieldLabelProps doesn't model `children` in its polymorphic types, though it renders them fine.
      <Field.Label>{props.inputLabel}</Field.Label>
    )}
    <InputGroup endElement={props.append}>
      <ChakraInput
        autoComplete={
          props.inputType === 'password'
            ? 'new-password'
            : props.autoComplete || 'off'
        }
        tabIndex={props.tabIndex}
        type={props.inputType}
        name={props.inputName}
        className={props.className}
        placeholder={props.placeholderValue}
        onChange={props.onChange}
        value={props.value}
        disabled={props.disabled}
        minLength={props.min}
        maxLength={props.max}
        step={props.step}
        autoFocus={props.autoFocus}
        ref={props.innerRef}
        bg="white"
      />
    </InputGroup>
  </Field.Root>
);

export default Input;
