import React, { useState } from 'react';
import moment from 'moment-timezone';
import DatePicker from '../common/DatePicker/DatePicker';
import NewClosing from '../Closing/NewClosing';

const Report: React.FC<{}> = ({}) => {
  const [date, setDate] = useState(moment());

  return (
    <React.Fragment>
      <div className="row">
        {
          <div className="col-md-4  ml-auto">
            <DatePicker
              inputLabel="Select Date"
              maxDate={new Date()}
              selected={date.toDate()}
              onChange={(selectedDate: Date) => {
                setDate(moment(selectedDate));
              }}
            ></DatePicker>
          </div>
        }
      </div>
      <NewClosing date={date.toDate()} isView={true}/>
    </React.Fragment>
  );
};

export default Report;
