import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import { useQuery } from '@apollo/react-hooks';
import { GET_SALES } from '../../graphql/query/sale';
import _ from 'lodash';
import { Sale } from '../../generated/graphql';
import Loader from '../Loaders/Loader';
import moment from 'moment-timezone';
import SaleCard from './Sale';
import DatePicker from '../common/DatePicker/DatePicker';

interface Props {
  billNumber?: string;
}

const Sales: NextPage<Props> = function () {
  const [date, setDate] = useState(moment());
  const { loading: saleLoading, data: saleData } = useQuery(GET_SALES, {
    variables: {
      date: {
        from: date.startOf('day').toDate(),
        to: date.endOf('day').toDate(),
      },
    },
    fetchPolicy: 'no-cache',
  });

  const [sales, setSales] = useState<Sale[]>();

  useEffect(() => {
    setSales(
      saleData?.getSalesForUser.sort(
        (a: Sale, b: Sale) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      ),
    );
  }, [saleData]);

  const getTotalProfit = () => {
    const profit =
      _.sum(sales?.map((s) => s.total)) -
      _.sum(
        _.flatten(sales?.map((s) => s.items)).map(
          (i) => (i.item?.price?.cost || i.item?.price?.list) * i.quantity,
        ),
      );
    return profit;
  };
  return (
    <React.Fragment>
      <div className="">
        <div className="row">
          <div className="col-md-2">
            <label className="form-label">{'P/L'}</label>{' '}
            <div className={getTotalProfit() > 0 ? 'profit' : 'loss'}>
              {getTotalProfit() > 0 && '+'}
              {getTotalProfit()}₹
            </div>
            {}
          </div>
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
        </div>
        {saleLoading ? (
          <Loader />
        ) : (
          (!_.isEmpty(sales) &&
            sales.map((sale: Sale, i) => {
              return (
                <React.Fragment key={i}>
                  <SaleCard saleDetails={sale} />
                </React.Fragment>
              );
            })) || (
            <React.Fragment>
              <div className="card text-center p-5">No sales found</div>
            </React.Fragment>
          )
        )}
      </div>
      <style jsx global>{`
        .w-14 {
          width: 14%;
        }
        .card-options .form-group {
          width: 100%;
        }
      `}</style>
    </React.Fragment>
  );
};

export default Sales;
