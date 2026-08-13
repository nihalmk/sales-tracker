import React from 'react';
import ReactDatePicker from 'react-datepicker';
import { Field, Input, Box } from '@chakra-ui/react';

interface Props {
  selected: Date;
  onChange: any;
  inputLabel: string;
  maxDate: Date;
  minDate: Date;
}

const DatePicker: React.FunctionComponent<any> = (props: Props) => (
  <Box>
    <Field.Root>
      {props.inputLabel && (
        // @ts-expect-error Chakra v3's Ark UI-derived FieldLabelProps doesn't model `children` in its polymorphic types, though it renders them fine.
        <Field.Label>{props.inputLabel}</Field.Label>
      )}
      <Box w="full">
        <ReactDatePicker
          selected={props.selected}
          onChange={props.onChange}
          peekNextMonth
          showMonthDropdown
          showYearDropdown
          dropdownMode="select"
          dateFormat="dd.MM.yyyy"
          minDate={props.minDate}
          maxDate={props.maxDate}
          customInput={<Input bg="white" />}
        />
      </Box>
    </Field.Root>
    <style jsx global>{`
      .react-datepicker__input-container,
      .react-datepicker-wrapper {
        width: 100%;
      }
      .react-datepicker-popper {
        z-index: 9999 !important;
      }
    `}</style>
  </Box>
);

export default DatePicker;
