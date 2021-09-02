import React, { useState } from 'react';
import moment from 'moment-timezone';
import DatePicker from '../common/DatePicker/DatePicker';
import NewClosing from '../Closing/NewClosing';

const Report: React.FC<{}> = ({}) => {
  const [startDate, setStartDate] = useState(moment());
  const [endDate, setEndDate] = useState(moment());

  const [submittedDate, setSubmittedDate] = useState({
    startDate,
    endDate,
  });
  return (
    <React.Fragment>
      <div className="row">
        <div className="col-md-4  ml-auto">
          <DatePicker
            inputLabel="Select Start Date"
            maxDate={new Date()}
            selected={startDate.toDate()}
            onChange={(selectedDate: Date) => {
              setStartDate(moment(selectedDate));
            }}
          ></DatePicker>
        </div>
        <div className="col-md-4">
          <DatePicker
            inputLabel="Select End Date"
            maxDate={new Date()}
            selected={endDate.toDate()}
            onChange={(selectedDate: Date) => {
              setEndDate(moment(selectedDate));
            }}
          ></DatePicker>
        </div>
        <button
          type="button"
          className="btn btn-primary btn-adjust"
          onClick={() => {
            setSubmittedDate({
              startDate,
              endDate,
            });
          }}
        >
          <strong>Search</strong>
        </button>
      </div>
      <NewClosing
        startDate={submittedDate.startDate.toDate()}
        endDate={submittedDate.endDate.toDate()}
        isView={true}
      />
      <style jsx>{`
        .btn-adjust {
          height: 37px;
          margin-top: 29px;
        }
      `}</style>
    </React.Fragment>
  );
};

export default Report;
