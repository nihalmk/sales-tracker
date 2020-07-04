import React, { useState, ChangeEvent, useEffect } from 'react';
import { NextPage } from 'next';
import { useMutation, useQuery } from '@apollo/react-hooks';
import { CREATE_SALE, UPDATE_SALE } from '../../graphql/mutation/sale';
import { GET_SALE_BY_BILL_NUMBER } from '../../graphql/query/sale';
import Input from '../common/Inputs/FormInput';
import SuccessMessage from '../Alerts/SuccessMessage';
import ErrorMessage from '../Errors/ErrorMessage';
import _ from 'lodash';
import { Sale, SaleItem, Items, SaleItemInput } from '../../generated/graphql';
import Loader from '../Loaders/Loader';
import { removeUnderscoreKeys } from '../../utils/helpers';
import SelectBox, { LabelValueObj } from '../common/SelectBoxes/SelectBox';
import { GET_ITEMS } from '../../graphql/query/items';
import Link from 'next/link';

interface Props {
  billNumber?: string;
}

const AddSale: NextPage<Props> = function ({ billNumber }) {
  const [submitCreateSale, { loading: createLoading }] = useMutation(
    CREATE_SALE,
  );
  const [submitUpdateSale, { loading: updateLoading }] = useMutation(
    UPDATE_SALE,
  );

  const {
    loading: saleLoading,
    data: saleData,
    refetch: refetchSale,
  } = useQuery(GET_SALE_BY_BILL_NUMBER, {
    variables: {
      billNumber,
    },
    skip: !billNumber,
    fetchPolicy: 'no-cache',
  });

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [newItemSubmitted, setNewItemSubmitted] = useState(false);
  const [updateSubmitted, setUpdateSubmitted] = useState(false);
  // const [searchTerm, setSearchTerm] = useState('');
  const [sale, setSale] = useState<Sale[]>();

  useEffect(() => {
    setSale(saleData?.getSaleByBillNumber?.[0]);
  }, [saleData]);

  const [newSale, setNewSale] = useState<Sale>();

  const [editSale, setEditSale] = useState<SaleItem>();

  const { loading: itemsLoading, data: itemsData } = useQuery(GET_ITEMS, {
    fetchPolicy: 'no-cache',
  });

  const [items, setItems] = useState<Items[]>();

  const [itemsSelection, setItemsSelection] = useState<LabelValueObj[]>();

  useEffect(() => {
    const sortedItems = _.sortBy(itemsData?.getItemsForUser, 'name') as Items[];
    setItemsSelection(
      _.compact(
        sortedItems.map((i) => {
          if (i.stock > 0 || i.stock === -1) {
            return {
              label: i.name,
              value: i._id,
            };
          }
        }),
      ),
    );
    setItems(sortedItems);
  }, [itemsData]);

  const [saleItems, setSaleItems] = useState<SaleItem[]>([]);
  const [newSaleItem, setNewSaleItem] = useState<SaleItem>();
  const [newItem, setNewItem] = useState<Items>();

  useEffect(() => {
    setSaleItems(saleData?.getSaleByBillNumber?.[0].items || []);
  }, [saleData]);

  useEffect(() => {
    console.log(sale);
  }, [sale]);

  useEffect(() => {
    setNewSale((currentState) => ({
      ...currentState,
      items: saleItems,
      total: _.sum(saleItems.map((i) => i.total)),
    }));
  }, [saleItems]);

  const onNewSaleCreate = async (e?: React.SyntheticEvent) => {
    e && e.preventDefault();
    const { customer, contact, email, items, total } = newSale || {};
    const profit =
      total - _.sum(items.map((i) => i.item?.price?.cost * i.quantity));
    const loss = profit < 0 ? Math.abs(profit) : 0;
    const discount =
      _.sum(items.map((i) => i.discount)) + (newSale.discount || 0);
    setSubmitted(true);
    if (!customer || _.isEmpty(items) || !contact) {
      setError('Please enter values for all fields');
      setTimeout(() => {
        setError('');
      }, 5000);
      return;
    }
    const saleItems = items.map((i) => {
      const saleItem = (i as unknown) as SaleItemInput;
      saleItem.item = i.item._id;
      return saleItem;
    });
    try {
      await submitCreateSale({
        variables: {
          customer,
          contact,
          email,
          items: saleItems,
          total,
          discount,
          profit,
          loss,
        },
      });
      setMessage('New sale added successfully');
      setNewSale(undefined);
      setSaleItems([]);
      setSubmitted(false);
      setTimeout(() => {
        setMessage('');
      }, 5000);
    } catch (e) {
      setError(`Error adding new sale. ${e.message}`);
      setTimeout(() => {
        setError('');
      }, 5000);
    }
  };

  const onSaleEdit = async (e?: React.SyntheticEvent) => {
    e && e.preventDefault();
    const { customer, contact, email, items, _id, total } = newSale || {};
    const profit = total - _.sum(items.map((i) => i.item?.price?.cost));
    const loss = profit < 0 ? Math.abs(profit) : 0;
    const discount =
      _.sum(items.map((i) => i.discount)) + (newSale.discount || 0);
    setUpdateSubmitted(true);
    if (!customer || !_.isEmpty(items) || !contact) {
      setError('Please enter values for all fields');
      setTimeout(() => {
        setError('');
      }, 5000);
      return;
    }
    const saleItems = items.map((i) => {
      const saleItem = (i as unknown) as SaleItemInput;
      saleItem.item = i.item._id;
      return saleItem;
    });
    try {
      await submitUpdateSale({
        variables: {
          _id,
          customer,
          contact,
          email,
          items: removeUnderscoreKeys(saleItems),
          total,
          discount,
          profit,
          loss,
        },
      });
      await refetchSale();
      setEditSale(undefined);
      setMessage(`Sale ${name} Updated successfully`);
      setTimeout(() => {
        setMessage('');
      }, 5000);
    } catch (e) {
      setError(`Error adding new sale. ${e.message}`);
      setTimeout(() => {
        setError('');
      }, 5000);
    }
  };

  const onSaleUpdate = () => {
    const editedItemId = editSale?.item._id;
    const { items } = _.cloneDeep(newSale);
    let index = 0;
    if (!editSale.cost || !editSale.quantity) {
      return;
    }
    items.map((item, i) => {
      if (item.item._id === editedItemId) {
        index = i;
        if (!editSale.cost) {
          editSale.cost = item.cost;
        }
        if (!editSale.quantity) {
          editSale.quantity = 1;
        }
      }
    });
    items.splice(index, 1, editSale);
    setSaleItems(items);
    setEditSale(undefined);
  };

  const onSaleItemRemove = (id: string) => {
    const { items } = _.cloneDeep(newSale);
    setSaleItems(items.filter((i) => i.item._id !== id));
  };

  const onEdit = (sale: SaleItem, isEdit: boolean) => {
    if (!isEdit) {
      setEditSale(sale);
    } else {
      true || onSaleEdit();
      onSaleUpdate();
      setUpdateSubmitted(true);
    }
  };
  return (
    <React.Fragment>
      <div className="card">
        <div className="card-header">
          <div className="card-title">{'New Sale'}</div>
          <div className="card-options"></div>
        </div>
        <SuccessMessage message={message} />
        <ErrorMessage error={error} />
        <div className="card-body pb-0">
          <div className="row">
            <div className="col-md-4">
              <Input
                tabIndex={1}
                inputName="Customer"
                inputLabel="Customer"
                inputType="text"
                max={20}
                placeholderValue="Customer Name"
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                  const customer = e.target.value;
                  setNewSale((currentState) => ({
                    ...currentState,
                    customer,
                  }));
                }}
                autoFocus={true}
                isInvalid={!!(submitted && !newSale?.customer)}
                value={newSale?.customer || ''}
              />
            </div>
            <div className="col-md-4">
              <Input
                tabIndex={2}
                inputName="Contact"
                inputLabel="Contact Number"
                inputType="text"
                max={20}
                placeholderValue="Contact Number"
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                  const contact = e.target.value;
                  setNewSale((currentState) => ({
                    ...currentState,
                    contact,
                  }));
                }}
                isInvalid={!!(submitted && !newSale?.contact)}
                value={newSale?.contact || ''}
              />
            </div>
            <div className="col-md-4">
              <Input
                tabIndex={3}
                inputName="email"
                inputLabel="Email"
                inputType="text"
                max={50}
                placeholderValue="Email Id"
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                  const email = e.target.value;
                  setNewSale((currentState) => ({
                    ...currentState,
                    email,
                  }));
                }}
                isInvalid={!!(submitted && !newSale?.email)}
                value={newSale?.email || ''}
              />
            </div>
          </div>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setNewItemSubmitted(true);
            if (!newSaleItem) {
              {
                return;
              }
            }
            if (!newSaleItem.quantity) {
              newSaleItem.quantity = 1;
              newSaleItem.total = newSaleItem.cost * 1;
            }
            if (!newSaleItem.cost) {
              newSaleItem.cost = newItem.price?.sale;
              newSaleItem.total = newItem.price?.sale * newSaleItem.quantity;
            }
            setNewItemSubmitted(false);
            setSaleItems((currentState) => [
              ...(currentState || []),
              newSaleItem,
            ]);
            setNewSaleItem(undefined);
            setNewItem(undefined);
          }}
        >
          <div className="card-body pt-0">
            <div className="row">
              <div className="col-md-6">
                <SelectBox
                  tabIndex={4}
                  selectLabel="Product"
                  selectData={itemsSelection?.filter((i) => {
                    const saleItemsIds = saleItems.map((s) => s.item._id);
                    return !saleItemsIds.includes(i.value);
                  })}
                  isDisabled={itemsLoading}
                  onSelectChange={(e: LabelValueObj) => {
                    const itemId = e.value;
                    const item = items.find((i) => i._id === itemId);
                    setNewItem(item);
                    setNewSaleItem({
                      item: item,
                      quantity: 1,
                      discount: 0,
                      cost: item.price?.sale,
                      total: item.price?.sale,
                    });
                  }}
                  selectDefault={itemsSelection?.find(
                    (i) =>
                      i.value === ((newSaleItem?.item as unknown) as string),
                  )}
                  isInvalid={!!(newItemSubmitted && !newItem)}
                  noOptionsMessage={'Not in Stock'}
                ></SelectBox>
              </div>
              <div className="col-md-2">
                <Input
                  tabIndex={5}
                  inputName="Sale"
                  inputLabel="Sale Price"
                  inputType="tel"
                  max={20}
                  placeholderValue="Sale Price"
                  onChange={(e: ChangeEvent<HTMLInputElement>) => {
                    const cost = Number(e.target.value);
                    setNewSaleItem((currentState) => ({
                      ...currentState,
                      cost,
                      total: currentState.quantity * cost,
                    }));
                  }}
                  disabled={itemsLoading || !newItem}
                  isInvalid={!!(newItemSubmitted && !newSaleItem?.cost)}
                  value={newSaleItem?.cost || ''}
                />
              </div>
              <div className="col-md-2">
                <Input
                  tabIndex={6}
                  inputName="quantity"
                  inputLabel="Quantity"
                  inputType="tel"
                  max={20}
                  placeholderValue="Quantity"
                  onChange={(e: ChangeEvent<HTMLInputElement>) => {
                    const quantity = Number(e.target.value);
                    if (quantity > newItem.stock) {
                      setNewSaleItem((currentState) => ({
                        ...currentState,
                        quantity: newItem.stock,
                        total: newSaleItem?.cost * newItem.stock,
                      }));
                      return;
                    }
                    setNewSaleItem((currentState) => ({
                      ...currentState,
                      quantity,
                      total: newSaleItem?.cost * quantity,
                    }));
                  }}
                  disabled={createLoading || !newItem}
                  isInvalid={!!(newItemSubmitted && !newSaleItem?.quantity)}
                  value={newSaleItem?.quantity || ''}
                />
              </div>
              <div className="col-md-2">
                <Input
                  tabIndex={7}
                  inputName="total"
                  inputLabel="Total"
                  inputType="tel"
                  max={20}
                  placeholderValue="Total"
                  onChange={(e: ChangeEvent<HTMLInputElement>) => {
                    const total = Number(e.target.value);
                    setNewSaleItem((currentState) => ({
                      ...currentState,
                      total,
                    }));
                  }}
                  disabled={true}
                  isInvalid={!!(newItemSubmitted && !newSaleItem?.total)}
                  value={newSaleItem?.total || ''}
                />
              </div>
              <div className="col-md-2 ml-auto">
                <button
                  id="sale-submit"
                  type="submit"
                  className={
                    'btn btn-primary ml-auto w-100 ' +
                    (createLoading && 'btn-loading')
                  }
                >
                  Add New Item
                </button>
              </div>
            </div>
            {/* <button type="submit" hidden></button> */}
          </div>
        </form>
        {/* <div className="card-header">
          <div className="card-options w-25">
            <Input
              tabIndex={9}
              inputName="Search"
              inputType="text"
              max={20}
              placeholderValue="Search Product by Name or ID"
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                const search = e.target.value;
                setSearchTerm(search);
              }}
              disabled={createLoading || updateLoading}
              value={searchTerm || ''}
            />
          </div>
        </div> */}

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
              {(billNumber && saleLoading) || createLoading ? (
                <tr>
                  <td className={'text-center'} colSpan={6}>
                    <Loader />
                  </td>
                </tr>
              ) : (
                saleItems?.length === 0 && (
                  <tr>
                    <td className={'text-center'} colSpan={6}>
                      {'No Products added!'}
                    </td>
                  </tr>
                )
              )}
              {!createLoading && !saleLoading && saleItems?.length !== 0 && (
                <React.Fragment>
                  {saleItems?.map((sale: SaleItem, i: number) => {
                    const isEdit = editSale?.item._id === sale.item._id;
                    const item = sale.item;
                    return (
                      <tr key={i}>
                        <td>{item.shortId}</td>
                        <td className="w-25">{item.name}</td>
                        <td
                          className="w-14"
                          onSubmit={(e) => {
                            e.preventDefault();
                            onEdit(sale, isEdit);
                          }}
                        >
                          {isEdit ? (
                            <Input
                              tabIndex={11}
                              inputName="Sale"
                              inputType="number"
                              max={10}
                              placeholderValue="Sale Price"
                              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                                const cost = Number(e.target.value);
                                setEditSale((currentState) => ({
                                  ...currentState,
                                  cost,
                                  total: currentState.quantity * cost,
                                }));
                              }}
                              disabled={updateLoading}
                              isInvalid={!!(updateSubmitted && !editSale?.cost)}
                              value={editSale?.cost || ''}
                            />
                          ) : (
                            sale.cost
                          )}
                        </td>
                        <td className="w-14">
                          {isEdit ? (
                            <Input
                              tabIndex={12}
                              inputName="Quantity"
                              inputType="number"
                              max={10}
                              placeholderValue="Quantity"
                              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                                const quantity = Number(e.target.value);
                                if (item.stock > -1 && quantity > item.stock) {
                                  setEditSale((currentState) => ({
                                    ...currentState,
                                    quantity: item.stock,
                                    total: item.stock * currentState.cost,
                                  }));
                                  return;
                                }
                                setEditSale((currentState) => ({
                                  ...currentState,
                                  quantity,
                                  total: quantity * currentState.cost,
                                }));
                              }}
                              disabled={updateLoading}
                              isInvalid={
                                !!(updateSubmitted && !editSale?.quantity)
                              }
                              value={editSale?.quantity || ''}
                            />
                          ) : (
                            sale.quantity
                          )}
                        </td>
                        <td>{sale.total}</td>
                        <td className="w-14">
                          <button
                            onClick={() => onEdit(sale, isEdit)}
                            className={
                              'btn mr-2 ' +
                              (isEdit ? 'btn-success ' : 'btn-secondary ') +
                              (isEdit && updateLoading ? 'btn-loading' : '')
                            }
                          >
                            {isEdit ? 'Done' : 'Edit'}
                          </button>

                          <button
                            className="btn btn-secondary"
                            onClick={() => {
                              isEdit
                                ? setEditSale(undefined)
                                : onSaleItemRemove(sale.item._id);
                            }}
                          >
                            X
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  <tr>
                    <td colSpan={4}>
                      <strong>TOTAL</strong>
                    </td>
                    <td className="w-10">
                      <strong>{newSale?.total}</strong>
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
              onClick={onNewSaleCreate}
            >
              Submit
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

export default AddSale;
