import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import { useQuery } from '@apollo/react-hooks';
import { GET_PURCHASE_BY_BILL_NUMBER } from '../../graphql/query/purchase';
import _ from 'lodash';
import { Purchase, PurchaseItem } from '../../generated/graphql';
import Loader from '../Loaders/Loader';
import moment from 'moment-timezone';
import { currency } from '../../utils/helpers';

interface Props {
  billNumber?: string;
  purchaseDetails?: Purchase;
  showContent?: boolean;
}

const PurchaseCard: NextPage<Props> = function ({
  billNumber,
  purchaseDetails,
  showContent = true,
}) {
  const [view, setView] = useState(showContent);

  const { loading: purchaseLoading, data: purchaseData } = useQuery(
    GET_PURCHASE_BY_BILL_NUMBER,
    {
      variables: {
        billNumber,
      },
      skip: !billNumber,
      fetchPolicy: 'no-cache',
    },
  );

  // const [searchTerm, setSearchTerm] = useState('');
  const [purchase, setPurchase] = useState<Purchase>();

  useEffect(() => {
    setPurchase(purchaseData?.getPurchaseByBillNumber?.[0]);
  }, [purchaseData]);

  useEffect(() => {
    setPurchase(purchaseDetails);
  }, [purchase]);

  return (
    <React.Fragment>
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            #{billNumber || purchase?.billNumber} |{' '}
            {moment(purchase?.createdAt).format('MMMM Do YYYY, h:mm:ss a')}
          </div>
          <div className="card-options">
            <strong className="loss mr-4">
              {purchase?.total}
              {currency}
            </strong>
            <button
              type="button"
              className="btn btn-icon btn-secondary btn-sm"
              onClick={() => {
                setView(!view);
              }}
            >
              <strong className="bigger">{view ? '-' : '+'}</strong>
            </button>
          </div>
        </div>
        <div className={!view ? 'd-none' : ''}>
          <div className="card-body">
            <div className="row">
              <div className="col-md-4">
                <strong>Vendor: </strong> {purchase?.vendor}
              </div>
              <div className="col-md-4">
                <strong>Contact: </strong> {purchase?.contact}
              </div>
              <div className="col-md-4">
                <strong>Email: </strong> {purchase?.email}
              </div>
            </div>
          </div>

          <div className="table-responsive">
            <table className="table card-table table-hover table-outline">
              <thead>
                <tr>
                  <th className="w-10">#ID</th>
                  <th className="w-25">Product</th>
                  <th>Purchase Price</th>
                  <th>Quantity</th>
                  <th>Total</th>
                  <th className="w-14">Action</th>
                </tr>
              </thead>
              <tbody>
                {billNumber && purchaseLoading ? (
                  <tr>
                    <td className={'text-center'} colSpan={6}>
                      <Loader />
                    </td>
                  </tr>
                ) : (
                  purchase?.items.length === 0 && (
                    <tr>
                      <td className={'text-center'} colSpan={6}>
                        {'No Products added!'}
                      </td>
                    </tr>
                  )
                )}
                {!purchaseLoading && purchase?.items?.length !== 0 && (
                  <React.Fragment>
                    {purchase?.items?.map(
                      (purchase: PurchaseItem, i: number) => {
                        const item = purchase.item;
                        return (
                          <tr key={i}>
                            <td>{item.shortId}</td>
                            <td className="w-25">{item.name}</td>
                            <td className="w-14">{purchase.cost}</td>
                            <td className="w-14">{purchase.quantity}</td>
                            <td>{purchase.total}</td>
                            <td className="w-14">XXXX</td>
                          </tr>
                        );
                      },
                    )}
                    <tr>
                      <td colSpan={4}>
                        <strong>TOTAL</strong>
                      </td>
                      <td className="w-10">
                        <strong>{purchase?.total}</strong>
                      </td>
                      <td className="w-14"></td>
                    </tr>
                  </React.Fragment>
                )}
              </tbody>
            </table>
          </div>
          <div className="card-footer">
            <div className="d-flex">
              <button
                id="shop-submit"
                type="submit"
                className={'btn btn-primary ml-auto '}
                disabled={true}
                // onClick={onPurchaseEdit}
              >
                Edit
              </button>
            </div>
          </div>
        </div>
      </div>
      <style jsx>{`
        .w-10 {
          width: 10%;
        }
        .w-15 {
          width: 15%;
        }
        .link {
          color: blue !important;
          cursor: pointer;
        }
        .link:hover {
          border-bottom: 1px solid blue;
        }
      `}</style>
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

export default PurchaseCard;
