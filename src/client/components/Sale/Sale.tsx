import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import { useQuery } from '@apollo/react-hooks';
import { GET_SALE_BY_BILL_NUMBER } from '../../graphql/query/sale';
import _ from 'lodash';
import { Sale, SaleItem } from '../../generated/graphql';
import Loader from '../Loaders/Loader';
import moment from 'moment-timezone';

interface Props {
  billNumber?: string;
  saleDetails?: Sale;
}

const SaleCard: NextPage<Props> = function ({ billNumber, saleDetails }) {
  const { loading: saleLoading, data: saleData } = useQuery(
    GET_SALE_BY_BILL_NUMBER,
    {
      variables: {
        billNumber,
      },
      skip: !billNumber,
      fetchPolicy: 'no-cache',
    },
  );

  // const [searchTerm, setSearchTerm] = useState('');
  const [sale, setSale] = useState<Sale>();

  useEffect(() => {
    setSale(saleData?.getSaleByBillNumber?.[0]);
  }, [saleData]);

  useEffect(() => {
    setSale(saleDetails);
  }, [sale]);

  return (
    <React.Fragment>
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            #{billNumber || sale?.billNumber} |{' '}
            {moment(sale?.createdAt).format('MMMM Do YYYY, h:mm:ss a')}
          </div>
          <div className="card-options"></div>
        </div>
        <div className="card-body">
          <div className="row">
            <div className="col-md-4">
              <strong>Customer: </strong> {sale?.customer}
            </div>
            <div className="col-md-4">
              <strong>Contact: </strong> {sale?.contact}
            </div>
            <div className="col-md-4">
              <strong>Email: </strong> {sale?.email}
            </div>
          </div>
        </div>

        <div className="table-responsive">
          <table className="table card-table table-hover table-outline">
            <thead>
              <tr>
                <th className="w-10">#ID</th>
                <th className="w-25">Product</th>
                <th>Sale Price</th>
                <th>Quantity</th>
                <th>Total</th>
                <th className="w-14">Action</th>
              </tr>
            </thead>
            <tbody>
              {billNumber && saleLoading ? (
                <tr>
                  <td className={'text-center'} colSpan={6}>
                    <Loader />
                  </td>
                </tr>
              ) : (
                sale?.items.length === 0 && (
                  <tr>
                    <td className={'text-center'} colSpan={6}>
                      {'No Products added!'}
                    </td>
                  </tr>
                )
              )}
              {!saleLoading && sale?.items?.length !== 0 && (
                <React.Fragment>
                  {sale?.items?.map((sale: SaleItem, i: number) => {
                    const item = sale.item;
                    return (
                      <tr key={i}>
                        <td>{item.shortId}</td>
                        <td className="w-25">{item.name}</td>
                        <td className="w-14">{sale.cost}</td>
                        <td className="w-14">{sale.quantity}</td>
                        <td>{sale.total}</td>
                        <td className="w-14">XXXX</td>
                      </tr>
                    );
                  })}
                  <tr>
                    <td colSpan={4}>
                      <strong>TOTAL</strong>
                    </td>
                    <td className="w-10">
                      <strong>{sale?.total}</strong>
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
              // onClick={onSaleEdit}
            >
              Edit
            </button>
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

export default SaleCard;
