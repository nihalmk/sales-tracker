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
import { currency } from '../../utils/helpers';

interface Props {
  billNumber?: string;
  saleDateFrom?: Date;
  saleDateTo?: Date;
  hideExtraFields?: boolean;
  callback?: (salesIds: string[], total: number) => void;
}

const Sales: NextPage<Props> = function ({
  saleDateFrom,
  saleDateTo,
  hideExtraFields,
  callback,
}) {
  const [date, setDate] = useState(
    saleDateFrom ? moment(saleDateFrom) : moment(),
  );
  const { loading: saleLoading, data: saleData } = useQuery(GET_SALES, {
    variables: {
      date: {
        from: date.startOf('day').toDate(),
        to: (saleDateTo ? moment(saleDateTo) : date).endOf('day').toDate(),
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

  useEffect(() => {
    if (sales && callback) {
      callback(
        sales.map((s) => s._id),
        _.sum(sales.map((s) => s.total)),
      );
    }
  }, [sales]);

  const total = _.sum(sales?.map((s) => s.total));
  const getTotalProfit = () => {
    const profit =
      total -
      _.sum(
        _.flatten(sales?.map((s) => s.items)).map(
          (i) => (i.item?.price?.cost || i.item?.price?.list) * i.quantity,
        ),
      );
    return profit;
  };

  const TotalSection = () => {
    return (
      <div className={`col-md-2 ${hideExtraFields && 'ml-auto text-right'}`}>
        <label className="form-label">{'Total'}</label>{' '}
        <div className={getTotalProfit() > 0 ? 'profit' : 'loss'}>
          {total}
          {currency}
        </div>
        <label className="form-label">{'Profile/Loss'}</label>{' '}
        <div className={getTotalProfit() > 0 ? 'profit' : 'loss'}>
          {getTotalProfit() > 0 && '+'}
          {getTotalProfit()}
          {currency}
        </div>
      </div>
    );
  };
  return (
    <React.Fragment>
      <div className="">
        <div className="hide-in-print row">
          <TotalSection />
          {!saleDateFrom && (
            <div className="hide-in-print col-md-4  ml-auto">
              <DatePicker
                inputLabel="Select Date"
                maxDate={new Date()}
                selected={date.toDate()}
                onChange={(selectedDate: Date) => {
                  setDate(moment(selectedDate));
                }}
              ></DatePicker>
            </div>
          )}
        </div>
        {!hideExtraFields && (
          <React.Fragment>
            {saleLoading ? (
              <Loader />
            ) : (
              (!_.isEmpty(sales) &&
                sales.map((sale: Sale, i) => {
                  return (
                    <React.Fragment key={i}>
                      <SaleCard
                        saleDetails={sale}
                        showContent={!hideExtraFields}
                      />
                    </React.Fragment>
                  );
                })) || (
                <React.Fragment>
                  <div className="card text-center p-5">No sales found</div>
                </React.Fragment>
              )
            )}
          </React.Fragment>
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
