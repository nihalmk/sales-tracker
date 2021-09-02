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
import Print from '../common/Print';
// import UserContext from '../UserWrapper/UserContext';

interface Props {
  closingId?: string;
  startDate?: Date;
  endDate?: Date;
  isView?: boolean;
}

const NewClosing: NextPage<Props> = function ({ startDate, endDate, isView }) {
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
        from: moment(startDate).startOf('day').toDate(),
        to: moment(endDate || startDate)
          .endOf('day')
          .toDate(),
      },
    },
    fetchPolicy: 'no-cache',
  });

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [, setSubmitted] = useState(false);
  const [salesTotal, setSalesTotal] = useState(0);
  const [purchaseTotal, setPurchaseTotal] = useState(0);
  const [today, setToday] = useState(startDate ? moment(startDate) : moment());
  const [newClosing, setNewClosing] = useState<CreateClosingInput>();
  const [allClosings, setAllClosings] = useState<CreateClosingInput[]>();
  const [prevClosing, setPrevClosing] = useState<Closing>();
  const [spentTotal, setSpentTotal] = useState(0);
  const [receivedTotal, setReceivedTotal] = useState(0);
  const [closingConfirmation, setClosingConfirmation] = useState(false);
  const [spentView, setSpentView] = useState(!isView);
  const [receivedView, setRecievedView] = useState(!isView);
  const [purchasesView, setPurchasesView] = useState(false);
  const [salesView, setSalesView] = useState(false);

  useEffect(() => {
    if (closings?.getClosingForUser) {
      setNewClosing(closings.getClosingForUser[0]);
      setAllClosings(closings.getClosingForUser);
      setReceivedTotal(
        _.sum(
          _.flatMap(
            (closings.getClosingForUser as CreateClosingInput[])?.map((c) =>
              c.receivedItems.map((s) => s.amount),
            ),
          ),
        ),
      );
      setSpentTotal(
        _.sum(
          _.flatMap(
            (closings.getClosingForUser as CreateClosingInput[])?.map((c) =>
              c.spentItems.map((s) => s.amount),
            ),
          ),
        ),
      );
    }
  }, [closings]);

  useEffect(() => {
    setToday(moment(startDate));
  }, [startDate]);

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
  console.log(salesTotal, receivedTotal, purchaseTotal, spentTotal);

  const getNetTotal = () => {
    console.log(salesTotal, receivedTotal, purchaseTotal, spentTotal);
    return salesTotal + receivedTotal - purchaseTotal - spentTotal;
  };
  return (
    <React.Fragment>
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            {isView ? 'Report | ' : 'New Closing | '}
            {today.format('DD/MM/YYYY')}{' '}
            {endDate && `- ${moment(endDate).format('DD/MM/YYYY')}`}
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
          <button
            type="button"
            className="btn btn-icon btn-primary btn-sm w-100 hide-in-print"
            onClick={() => {
              setSalesView(!salesView);
            }}
          >
            {(salesView ? 'Hide' : 'View') + ' Sales'}
          </button>
          <div className="card-body pb-0">
            <Sales
              hideExtraFields={!salesView}
              saleDateFrom={today.toDate()}
              saleDateTo={endDate}
              callback={(salesIds, total) => {
                !isView &&
                  setNewClosing((currentState) => ({
                    ...currentState,
                    salesIds,
                  }));
                setSalesTotal(total);
              }}
            />
          </div>
          <h4>Purchases</h4>
          <button
            type="button"
            className="btn btn-icon btn-primary btn-sm w-100 hide-in-print"
            onClick={() => {
              setPurchasesView(!purchasesView);
            }}
          >
            {(purchasesView ? 'Hide' : 'View') + ' Purchases'}
          </button>
          <div className="card-body pb-0">
            <Purchases
              hideExtraFields={!purchasesView}
              purchaseFromDate={today.toDate()}
              purchaseToDate={endDate}
              callback={(_purchaseIds, total) => {
                setPurchaseTotal(total);
              }}
            />
          </div>
          <h4>Expenses</h4>
          <small className="text-muted">
            * Include borrowed money to deduct money received from sales
          </small>
          <div className="card p-0" id={newClosing?.date}>
            <div className={'p-2 loss  ml-auto'}>
              {spentTotal}
              {currency}
            </div>
            <button
              type="button"
              className="btn btn-icon btn-primary btn-sm hide-in-print"
              onClick={() => {
                setSpentView(!spentView);
              }}
            >
              {(spentView ? 'Hide' : 'View') + ' Received Items'}
            </button>
            {spentView && (
              <Spent
                callback={(spentItems) => {
                  !isView &&
                    setSpentTotal(_.sum(spentItems.map((s) => s.amount)));
                  !isView &&
                    setNewClosing((currentState) => ({
                      ...currentState,
                      spentItems,
                    }));
                }}
                isView={isView}
                spentItemsList={_.flatMap(
                  allClosings?.map((c) => c.spentItems),
                )}
                id={newClosing?.date}
              />
            )}
          </div>
          <h4 className="pt-3">Received</h4>
          <div className="card p-0" id={newClosing?.date}>
            <div className={'p-2 profit ml-auto'}>
              {receivedTotal}
              {currency}
            </div>
            <button
              type="button"
              className="btn btn-icon btn-primary btn-sm hide-in-print "
              onClick={() => {
                setRecievedView(!receivedView);
              }}
            >
              {(receivedView ? 'Hide' : 'View') + ' Spent Items'}
            </button>
            {receivedView && (
              <Received
                callback={(receivedItems) => {
                  !isView &&
                    setReceivedTotal(_.sum(receivedItems.map((s) => s.amount)));

                  !isView &&
                    setNewClosing((currentState) => ({
                      ...currentState,
                      receivedItems,
                    }));
                }}
                isView={isView}
                receivedItemsList={_.flatMap(
                  allClosings?.map((c) => c.receivedItems),
                )}
                id={newClosing?.date}
              />
            )}
          </div>
          <div className="card mt-3 mb-3 p-2">
            <div className="row bigger">
              <strong className="col-md-9">
                {isView
                  ? 'Net Balance (Sales Total + Received Total - Purchases Total - Expenses Total)'
                  : 'Closing Balance'}
              </strong>
              <strong className="col-md-3 profit">
                {isView ? getNetTotal() || 0 : getTotal()[0].toFixed(2)}
                {currency}
              </strong>
            </div>
          </div>
        </div>
        <div className="card-footer">
          <div className="d-flex">
            <Link href="/dashboard">
              <button
                type="button"
                className={'btn btn-outline-danger hide-in-print'}
              >
                Cancel
              </button>
            </Link>
            <Print setPrintStatus={() => {}} className="ml-auto" />
            <button
              id="shop-submit"
              type="submit"
              className={
                'btn btn-primary ml-3 hide-in-print ' +
                (createLoading && 'btn-loading')
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
            !startDate
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
