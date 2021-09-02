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
  hideExtraFields?: boolean;
  purchaseFromDate?: Date;
  purchaseToDate?: Date;
  callback?: (purchaseIds: string[], total: number) => void;
}

const Purchases: NextPage<Props> = function ({
  hideExtraFields,
  purchaseFromDate,
  purchaseToDate,
  callback,
}) {
  const [date, setDate] = useState(
    purchaseFromDate ? moment(purchaseFromDate) : moment(),
  );
  const { loading: purchaseLoading, data: purchaseData } = useQuery(
    GET_PURCHASES,
    {
      variables: {
        date: {
          from: date.startOf('day').toDate(),
          to: (purchaseToDate ? moment(purchaseToDate) : date)
            .endOf('day')
            .toDate(),
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

  useEffect(() => {
    if (purchases && callback) {
      callback(
        purchases.map((s) => s._id),
        _.sum(purchases.map((s) => s.total)),
      );
    }
  }, [purchases]);

  const getTotal = () => {
    const total = _.sum(purchases?.map((s) => s.total));
    return total;
  };

  const TotalSection = () => {
    return (
      <div className={`col-md-2  ${hideExtraFields && 'ml-auto text-right'}`}>
        <label className="form-label   ml-auto">{'Total'}</label>{' '}
        <div className={'loss'}>-{getTotal()}₹</div>
      </div>
    );
  };
  return (
    <React.Fragment>
      <div className="">
        <div className="row">
          <TotalSection />
          {!purchaseFromDate && (
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
          )}
        </div>
        {!hideExtraFields && (
          <React.Fragment>
            {purchaseLoading ? (
              <Loader />
            ) : (
              (!_.isEmpty(purchases) &&
                purchases.map((purchase: Purchase, i) => {
                  return (
                    <React.Fragment key={i}>
                      <PurchaseCard
                        purchaseDetails={purchase}
                        showContent={!hideExtraFields}
                      />
                    </React.Fragment>
                  );
                })) || (
                <React.Fragment>
                  <div className="card text-center p-5">No purchases found</div>
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

export default Purchases;
