import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import { useQuery } from '@apollo/react-hooks';
import { GET_PURCHASES } from '../../graphql/query/purchase';
import _ from 'lodash';
import { Purchase } from '../../generated/graphql';
import Loader from '../Loaders/Loader';
import moment from 'moment-timezone';
import PurchaseCard from './Purchase';
import DatePicker from '../common/DatePicker/DatePicker';

interface Props {
  billNumber?: string;
}

const Purchases: NextPage<Props> = function () {
  const [date, setDate] = useState(moment());
  const { loading: purchaseLoading, data: purchaseData } = useQuery(
    GET_PURCHASES,
    {
      variables: {
        date: {
          from: date.startOf('day').toDate(),
          to: date.endOf('day').toDate(),
        },
      },
      fetchPolicy: 'no-cache',
    },
  );

  const [purchases, setPurchases] = useState<Purchase[]>();

  useEffect(() => {
    setPurchases(
      purchaseData?.getPurchasesForUser.sort(
        (a: Purchase, b: Purchase) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      ),
    );
  }, [purchaseData]);

  const getTotal = () => {
    const total = _.sum(purchases?.map((s) => s.total));
    return total;
  };
  return (
    <React.Fragment>
      <div className="">
        <div className="row">
          <div className="col-md-2">
            <label className="form-label">{'Total'}</label>{' '}
            <div className={'loss'}>-{getTotal()}₹</div>
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
        {purchaseLoading ? (
          <Loader />
        ) : (
          (!_.isEmpty(purchases) &&
            purchases.map((purchase: Purchase, i) => {
              return (
                <React.Fragment key={i}>
                  <PurchaseCard purchaseDetails={purchase} />
                </React.Fragment>
              );
            })) || (
            <React.Fragment>
              <div className="card text-center p-5">No purchases found</div>
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

export default Purchases;
