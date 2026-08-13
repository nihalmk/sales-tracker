import React, { useState } from 'react';
import moment from 'moment-timezone';
import DatePicker from '../common/DatePicker/DatePicker';
import NewClosing from '../Closing/NewClosing';
import { Flex, Box, Button } from '@chakra-ui/react';
import Icon from '../common/Icon';

const Report: React.FC<{}> = ({}) => {
  const [startDate, setStartDate] = useState(moment());
  const [endDate, setEndDate] = useState(moment());

  const [submittedDate, setSubmittedDate] = useState({
    startDate,
    endDate,
  });
  return (
    <React.Fragment>
      <Flex gap={4} mb={5} align="flex-end" wrap="wrap">
        <Box flex="1" minW="200px">
          <DatePicker
            inputLabel="Select Start Date"
            maxDate={new Date()}
            selected={startDate.toDate()}
            onChange={(selectedDate: Date) => {
              setStartDate(moment(selectedDate));
            }}
          ></DatePicker>
        </Box>
        <Box flex="1" minW="200px">
          <DatePicker
            inputLabel="Select End Date"
            maxDate={new Date()}
            selected={endDate.toDate()}
            onChange={(selectedDate: Date) => {
              setEndDate(moment(selectedDate));
            }}
          ></DatePicker>
        </Box>
        <Button
          colorPalette="brand"
          onClick={() => {
            setSubmittedDate({
              startDate,
              endDate,
            });
          }}
        >
          <Icon name="search" light />
          Search
        </Button>
      </Flex>
      <NewClosing
        startDate={submittedDate.startDate.toDate()}
        endDate={submittedDate.endDate.toDate()}
        isView={true}
      />
    </React.Fragment>
  );
};

export default Report;
