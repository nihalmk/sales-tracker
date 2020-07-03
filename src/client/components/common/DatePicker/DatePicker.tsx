import React from 'react';
import ReactDatePicker from 'react-datepicker';
interface Props {
  selected: Date;
  onChange: any;
  inputLabel: string;
  maxDate: Date;
  minDate: Date;
}

const DatePicker: React.FunctionComponent<any> = (props: Props) => (
  <div>
    <div className="form-group label-margin">
      {props.inputLabel ? (
        <label className="form-label">{props.inputLabel}</label>
      ) : (
        ''
      )}

      <div>
        <ReactDatePicker
          className={'form-control form-control-no-padding'}
          selected={props.selected}
          onChange={props.onChange}
          peekNextMonth
          showMonthDropdown
          showYearDropdown
          dropdownMode="select"
          dateFormat="dd.MM.yyyy"
          minDate={props.minDate}
          maxDate={props.maxDate}
        />
      </div>
    </div>
    <style jsx global>{`
      .form-control.form-control-no-padding {
        padding: 0.555em;
        border-radius: 5px;
      }
      .react-datepicker__input-container,
      .react-datepicker-wrapper {
        width: 100%;
      }
      .form-control:focus {
        box-shadow: none;
      }
      .is-invalid {
        border-color: #cd201f;
      }
      .label-margin {
        marging-bottom: 4px;
      }
      .date-text {
        padding-top: 3px;
      }
      .react-datepicker-popper {
        z-index: 9999 !important;
      }
    `}</style>
  </div>
);

export default DatePicker;
