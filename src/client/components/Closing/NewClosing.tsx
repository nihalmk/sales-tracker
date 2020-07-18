import React, {
  useState,
  useEffect,
  useContext,
  // useContext
} from 'react';
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
import {
  GET_PREVIOUS_CLOSING,
  GET_CLOSINGS,
} from '../../graphql/query/closing';
import Loader from '../Loaders/Loader';
import { currency } from '../../utils/helpers';
import ConfirmationDialog from '../Alerts/ConfirmationDialog';
import OverLay from '../OverLay';
import { NavItems } from '../Navigation/Navigation';
import UserContext from '../UserWrapper/UserContext';
// import UserContext from '../UserWrapper/UserContext';

interface Props {
  closingId?: string;
  date?: Date;
  isView?: boolean;
}

const NewClosing: NextPage<Props> = function ({ date, isView }) {
  const { setSelectedMenu, setNavItems } = useContext(UserContext);

  const [submitCreateClosing, { loading: createLoading }] = useMutation(
    CREATE_CLOSING,
  );

  const { data: previousClosing, loading: previousClosingLoading } = useQuery(
    GET_PREVIOUS_CLOSING,
    {
      fetchPolicy: 'no-cache',
      skip: isView,
    },
  );

  const { data: closings, loading: closingsLoading } = useQuery(GET_CLOSINGS, {
    variables: {
      date: {
        from: moment(date).startOf('day').toDate(),
        to: moment(date).endOf('day').toDate(),
      },
    },
    fetchPolicy: 'no-cache',
  });

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [, setSubmitted] = useState(false);
  const [salesTotal, setSalesTotal] = useState(0);
  const [purchaseTotal, setPurchaseTotal] = useState(0);
  const [today, setToday] = useState(date ? moment(date) : moment());
  const [newClosing, setNewClosing] = useState<CreateClosingInput>();
  const [prevClosing, setPrevClosing] = useState<Closing>();
  // const [selectedClosing, setSelectedClosing] = useState<Closing>();
  const [closingConfirmation, setClosingConfirmation] = useState(false);

  useEffect(() => {
    if (closings?.getClosingForUser) {
      setNewClosing(closings.getClosingForUser[0]);
    }
  }, [closings]);

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
          date: today.endOf('day').toDate(),
        },
      });
      setMessage('New closing added successfully');
      setNewClosing(undefined);
      setSubmitted(false);
      setSelectedMenu(NavItems.REPORT);
      setNavItems({
        sale: false,
        stock: true,
        purchase: false,
        purchases: true,
        sales: true,
        closing: false,
        report: true,
      });
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

  if (previousClosingLoading || closingsLoading) {
    return (
      <React.Fragment>
        <div className="text-center p-4">Getting closing data...</div>
        <Loader />
      </React.Fragment>
    );
  }
  if (isView && !newClosing) {
    return (
      <React.Fragment>
        <div className="card">
          <div className="text-center p-4">No closing found</div>
        </div>
      </React.Fragment>
    );
  }
  return (
    <React.Fragment>
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            {isView ? 'Closing | ' : 'New Closing | '}
            {today.format('DD/MM/YYYY')}
          </div>
          <div className="card-options">
            {!isView && (
              <React.Fragment>
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
              </React.Fragment>
            )}
          </div>
        </div>
        <SuccessMessage message={message} />
        <ErrorMessage error={error} />
        <div className="card-body pb-0">
          <div className="mb-3">
            {!isView && !prevClosing?.inHandTotal && (
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
                !isView && setNewClosing((currentState) => ({
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
                !isView && setPurchaseTotal(total);
              }}
            />
          </div>
          <h4>Expenses</h4>
          <small className="text-muted">
            * Include borrowed money to deduct money received from sales
          </small>
          <div className="card-body p-0 border" id={newClosing.date}>
            <Spent
              callback={(spentItems) => {
                !isView && setNewClosing((currentState) => ({
                  ...currentState,
                  spentItems,
                }));
              }}
              isView={isView}
              spentItemsList={newClosing?.spentItems}
              id={newClosing.date}
            />
          </div>
          <h4 className="pt-3">Received</h4>
          <div className="card-body p-0 border" id={newClosing.date}>
            <Received
              callback={(receivedItems) => {
                !isView && setNewClosing((currentState) => ({
                  ...currentState,
                  receivedItems,
                }));
              }}
              isView={isView}
              receivedItemsList={newClosing?.receivedItems}
              id={newClosing.date}
            />
          </div>
          <div className="card-body mt-3 mb-3 p-2 border">
            <div className="row bigger">
              <strong className="col-md-9">Closing Balance</strong>
              <strong className="col-md-3 profit">
                {isView
                  ? newClosing?.inHandTotal || 0
                  : getTotal()[0].toFixed(2)}
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
              disabled={isView}
              onClick={() => {
                !isView && setClosingConfirmation(true);
              }}
            >
              Submit
            </button>
          </div>
        </div>
      </div>
      <OverLay show={!!closingConfirmation}>
        <ConfirmationDialog
          success={(success) => {
            if (success) {
              onNewClosingCreate();
            }
            setClosingConfirmation(false);
          }}
          message={`You won't be able to make changes after you submit. ${
            !date
              ? 'Please continue if you are closing for the day!'
              : 'Please confirm and continue!'
          }`}
        />
      </OverLay>
      <style jsx>{`
        .bigger {
          font-size: 23px;
        }
      `}</style>
    </React.Fragment>
  );
};

export default NewClosing;
