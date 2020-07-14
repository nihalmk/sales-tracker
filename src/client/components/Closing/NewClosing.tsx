import React, { useState } from 'react';
import { NextPage } from 'next';
import { useMutation } from '@apollo/react-hooks';
import SuccessMessage from '../Alerts/SuccessMessage';
import ErrorMessage from '../Errors/ErrorMessage';
import _ from 'lodash';
import { CreateClosingInput } from '../../generated/graphql';
import Link from 'next/link';
import { CREATE_CLOSING } from '../../graphql/mutation/closing';
import moment from 'moment-timezone';
import Sales from '../Sale/Sales';
import Purchases from '../Purchase/Purchases';

interface Props {
  closingId?: string;
}

const NewClosing: NextPage<Props> = function ({}) {
  const [submitCreateClosing, { loading: createLoading }] = useMutation(
    CREATE_CLOSING,
  );
  const today = moment();
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [, setSubmitted] = useState(false);

  const [newClosing, setNewClosing] = useState<CreateClosingInput>();

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

  return (
    <React.Fragment>
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            {'New Closing | '}
            {today.format('DD/MM/YYYY')}
          </div>
          <div className="card-options"></div>
        </div>
        <SuccessMessage message={message} />
        <ErrorMessage error={error} />
        <div className="card-body pb-0">
          <h4>Sales</h4>
          <div className="card-body pb-0">
            <Sales hideExtraFields={true} saleDate={today.toDate()} />
          </div>
          <h4>Purchases</h4>
          <div className="card-body pb-0">
            <Purchases hideExtraFields={true} purchaseDate={today.toDate()} />
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
      <style jsx>{``}</style>
    </React.Fragment>
  );
};

export default NewClosing;
