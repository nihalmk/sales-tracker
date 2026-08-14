import React, { useEffect, useState } from 'react';
import moment from 'moment-timezone';
import DatePicker from '../common/DatePicker/DatePicker';
import ReportView from './ReportView';
import { useUrlFilters } from '../hooks/useUrlFilters';
import { Flex, Box, Button } from '@chakra-ui/react';
import Icon from '../common/Icon';

const Report: React.FC<{}> = ({}) => {
  const [startDate, setStartDate] = useState(moment());
  const [endDate, setEndDate] = useState(moment());

  const [submittedDate, setSubmittedDate] = useState({
    startDate,
    endDate,
  });

  const {
    params: urlParams,
    isReady: urlReady,
    setParams: setUrlParams,
  } = useUrlFilters();

  // Restores both the date pickers and the applied (searched) range from
  // the URL on load — a reload should show the same report, not reset back
  // to today.
  useEffect(() => {
    if (!urlReady) {
      return;
    }
    if (!urlParams.reportFrom && !urlParams.reportTo) {
      return;
    }
    const from = urlParams.reportFrom ? moment(urlParams.reportFrom) : moment();
    const to = urlParams.reportTo ? moment(urlParams.reportTo) : moment();
    setStartDate(from);
    setEndDate(to);
    setSubmittedDate({ startDate: from, endDate: to });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlReady]);

  // Persists the applied range (i.e. what was actually searched), not the
  // in-progress picker values — matches the Search-to-apply flow below.
  useEffect(() => {
    setUrlParams({
      reportFrom: submittedDate.startDate.format('YYYY-MM-DD'),
      reportTo: submittedDate.endDate.format('YYYY-MM-DD'),
    });
  }, [submittedDate, setUrlParams]);

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
          className="hide-in-print"
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
      <ReportView
        startDate={submittedDate.startDate.toDate()}
        endDate={submittedDate.endDate.toDate()}
      />
    </React.Fragment>
  );
};

export default Report;
