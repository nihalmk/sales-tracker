import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import { useMutation, useQuery } from '@apollo/react-hooks';
import SuccessMessage from '../Alerts/SuccessMessage';
import ErrorMessage from '../Errors/ErrorMessage';
import _ from 'lodash';
import { CreateClosingInput, Closing } from '../../generated/graphql';
import Link from 'next/link';
import { CREATE_CLOSING } from '../../graphql/mutation/closing';
import moment from 'moment-timezone';
import Sales from '../Sale/Sales';
import Purchases from '../Purchase/Purchases';
import { Spent } from './Spent';
import { Received } from './Received';
import { GET_PREVIOUS_CLOSING } from '../../graphql/query/closing';
import Loader from '../Loaders/Loader';
import { currency } from '../../utils/helpers';

interface Props {
  closingId?: string;
  date?: Date;
}

const NewClosing: NextPage<Props> = function ({ date }) {
  const [submitCreateClosing, { loading: createLoading }] = useMutation(
    CREATE_CLOSING,
  );

  const { data: previousClosing, loading: previousClosingLoading } = useQuery(
    GET_PREVIOUS_CLOSING,
    {
      fetchPolicy: 'no-cache',
    },
  );

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [, setSubmitted] = useState(false);
  const [salesTotal, setSalesTotal] = useState(0);
  const [purchaseTotal, setPurchaseTotal] = useState(0);
  const [today, setToday] = useState(date ? moment(date) : moment());
  const [newClosing, setNewClosing] = useState<CreateClosingInput>();
  const [prevClosing, setPrevClosing] = useState<Closing>();

  useEffect(() => {
    setToday(moment(date));
  }, [date]);

  useEffect(() => {
    if (previousClosing?.getPreviousClosing) {
      setPrevClosing(previousClosing.getPreviousClosing);
    }
  }, [previousClosing]);

  const onNewClosingCreate = async (e?: React.SyntheticEvent) => {
    e && e.preventDefault();
    const { salesIds, spentItems, receivedItems, spentTotal, inHandTotal } =
      newClosing || {};
    setSubmitted(true);
    try {
      await submitCreateClosing({
        variables: {
          salesIds,
          spentItems,
          receivedItems,
          spentTotal,
          inHandTotal,
          active: true,
          date: today.startOf('day').toDate(),
        },
      });
      setMessage('New closing added successfully');
      setNewClosing(undefined);
      setSubmitted(false);
      setTimeout(() => {
        setMessage('');
      }, 5000);
    } catch (e) {
      setError(`Error adding new closing. ${e.message}`);
      setTimeout(() => {
        setError('');
      }, 5000);
    }
  };

  const getTotal = () => {
    const receivedItemsTotal = _.sum(
      newClosing?.receivedItems?.map((s) => s.amount),
    );
    const spentTotal = _.sum(newClosing?.spentItems?.map((s) => s.amount));
    const inHandTotal =
      (prevClosing?.inHandTotal || 0) +
      salesTotal +
      receivedItemsTotal -
      (purchaseTotal + spentTotal);

    return [inHandTotal, spentTotal];
  };
  if (previousClosingLoading) {
    return (
      <React.Fragment>
        <div>Getting previous closing data...</div>
        <Loader />
      </React.Fragment>
    );
  }
  return (
    <React.Fragment>
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            {'New Closing | '}
            {today.format('DD/MM/YYYY')}
          </div>
          <div className="card-options">
            <span className="mr-2">
              Previous (
              {moment(
                prevClosing?.date || moment(today).subtract(1, 'days'),
              ).format('DD/MM/YYYY')}
              ):
            </span>
            <span className="profit">
              {prevClosing?.inHandTotal || 0}
              {currency}
            </span>
          </div>
        </div>
        <SuccessMessage message={message} />
        <ErrorMessage error={error} />
        <div className="card-body pb-0">
          <div className="mb-3">
            {!prevClosing?.inHandTotal && (
              <small className="btn btn-outline-danger w-100">
                * Add Total in hand on <strong>Received</strong> section for
                first time closing
              </small>
            )}
          </div>
          <h4>Sales</h4>
          <div className="card-body pb-0">
            <Sales
              hideExtraFields={true}
              saleDate={today.toDate()}
              callback={(salesIds, total) => {
                setNewClosing((currentState) => ({
                  ...currentState,
                  salesIds,
                }));
                setSalesTotal(total);
              }}
            />
          </div>
          <h4>Purchases</h4>
          <div className="card-body pb-0">
            <Purchases
              hideExtraFields={true}
              purchaseDate={today.toDate()}
              callback={(_purchaseIds, total) => {
                setPurchaseTotal(total);
              }}
            />
          </div>
          <h4>Expenses</h4>
          <small className="text-muted">
            * Include borrowed money to deduct money received from sales
          </small>
          <div className="card-body p-0 border">
            <Spent
              callback={(spentItems) => {
                setNewClosing((currentState) => ({
                  ...currentState,
                  spentItems,
                }));
              }}
            />
          </div>
          <h4 className="pt-3">Received</h4>
          <div className="card-body p-0 border">
            <Received
              callback={(receivedItems) => {
                setNewClosing((currentState) => ({
                  ...currentState,
                  receivedItems,
                }));
              }}
            />
          </div>
          <div className="card-body mt-3 mb-3 p-2 border">
            <div className="row bigger">
              <strong className="col-md-9">Closing Balance</strong>
              <strong className="col-md-3 profit">
                {getTotal()[0].toFixed(2)}
                {currency}
              </strong>
            </div>
          </div>
        </div>
        <div className="card-footer">
          <div className="d-flex">
            <Link href="/dashboard">
              <button type="button" className={'btn btn-outline-danger'}>
                Cancel
              </button>
            </Link>
            <button
              id="shop-submit"
              type="submit"
              className={
                'btn btn-primary ml-auto ' + (createLoading && 'btn-loading')
              }
              onClick={onNewClosingCreate}
            >
              Submit
            </button>
          </div>
        </div>
      </div>
      <style jsx>{`
        .bigger {
          font-size: 25px;
        }
      `}</style>
    </React.Fragment>
  );
};

export default NewClosing;
