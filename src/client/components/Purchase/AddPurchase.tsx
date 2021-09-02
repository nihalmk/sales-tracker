import React, { useState, ChangeEvent, useEffect, useRef } from 'react';
import { NextPage } from 'next';
import { useMutation, useQuery } from '@apollo/react-hooks';
import {
  CREATE_PURCHASE,
  UPDATE_PURCHASE,
} from '../../graphql/mutation/purchase';
import { GET_PURCHASE_BY_BILL_NUMBER } from '../../graphql/query/purchase';
import Input from '../common/Inputs/FormInput';
import SuccessMessage from '../Alerts/SuccessMessage';
import ErrorMessage from '../Errors/ErrorMessage';
import _ from 'lodash';
import {
  Purchase,
  PurchaseItem,
  Items,
  PurchaseItemInput,
} from '../../generated/graphql';
import Loader from '../Loaders/Loader';
import { removeUnderscoreKeys } from '../../utils/helpers';
import SelectBox, { LabelValueObj } from '../common/SelectBoxes/SelectBox';
import { GET_ITEMS } from '../../graphql/query/items';
import Link from 'next/link';

interface Props {
  billNumber?: string;
}

const AddPurchase: NextPage<Props> = function ({ billNumber }) {
  const productSelectRef = useRef<any>(null);

  const [submitCreatePurchase, { loading: createLoading }] = useMutation(
    CREATE_PURCHASE,
  );
  const [submitUpdatePurchase, { loading: updateLoading }] = useMutation(
    UPDATE_PURCHASE,
  );

  const {
    loading: purchaseLoading,
    data: purchaseData,
    refetch: refetchPurchase,
  } = useQuery(GET_PURCHASE_BY_BILL_NUMBER, {
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
  const [purchase, setPurchase] = useState<Purchase[]>();
  console.log(submitted, purchase);
  useEffect(() => {
    setPurchase(purchaseData?.getPurchaseByBillNumber?.[0]);
  }, [purchaseData]);

  const [newPurchase, setNewPurchase] = useState<Purchase>();

  const [editPurchase, setEditPurchase] = useState<PurchaseItem>();

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
          return {
            label: `${i.shortId} | ${i.name} ${
              i.stock > 0 ? `(${i.price.cost}₹)` : ''
            }`,
            value: i._id,
          };
        }),
      ),
    );
    setItems(sortedItems);
  }, [itemsData]);

  const [purchaseItems, setPurchaseItems] = useState<PurchaseItem[]>([]);
  const [newPurchaseItem, setNewPurchaseItem] = useState<PurchaseItem>();
  const [newItem, setNewItem] = useState<Items>();

  useEffect(() => {
    setPurchaseItems(purchaseData?.getPurchaseByBillNumber?.[0].items || []);
  }, [purchaseData]);

  useEffect(() => {
    setNewPurchase((currentState) => ({
      ...currentState,
      items: purchaseItems,
      total: _.sum(purchaseItems.map((i) => i.total)),
    }));
  }, [purchaseItems]);

  const onNewPurchaseCreate = async (e?: React.SyntheticEvent) => {
    e && e.preventDefault();
    const { vendor, contact, email, items, total } = newPurchase || {};
    setSubmitted(true);
    if (_.isEmpty(items)) {
      setError('Please enter values for all fields');
      setTimeout(() => {
        setError('');
      }, 5000);
      return;
    }
    const purchaseItems = _.cloneDeep(items).map((i) => {
      const purchaseItem = (i as unknown) as PurchaseItemInput;
      purchaseItem.item = i.item._id;
      return purchaseItem;
    });
    try {
      await submitCreatePurchase({
        variables: {
          vendor,
          contact,
          email,
          items: purchaseItems,
          total,
        },
      });
      setMessage('New purchase added successfully');
      setNewPurchase(undefined);
      setPurchaseItems([]);
      setSubmitted(false);
      setTimeout(() => {
        setMessage('');
      }, 5000);
    } catch (e) {
      setError(`Error adding new purchase. ${e.message}`);
      setTimeout(() => {
        setError('');
      }, 5000);
    }
  };

  const onPurchaseEdit = async (e?: React.SyntheticEvent) => {
    e && e.preventDefault();
    const { vendor, contact, email, items, _id, total } = newPurchase || {};
    setUpdateSubmitted(true);
    if (!_.isEmpty(items)) {
      setError('Please enter values for all fields');
      setTimeout(() => {
        setError('');
      }, 5000);
      return;
    }
    const purchaseItems = _.cloneDeep(items).map((i) => {
      const purchaseItem = (i as unknown) as PurchaseItemInput;
      purchaseItem.item = i.item._id;
      return purchaseItem;
    });
    try {
      await submitUpdatePurchase({
        variables: {
          _id,
          vendor,
          contact,
          email,
          items: removeUnderscoreKeys(purchaseItems),
          total,
        },
      });
      await refetchPurchase();
      setEditPurchase(undefined);
      setMessage(`Purchase ${name} Updated successfully`);
      setTimeout(() => {
        setMessage('');
      }, 5000);
    } catch (e) {
      setError(`Error adding new purchase. ${e.message}`);
      setTimeout(() => {
        setError('');
      }, 5000);
    }
  };

  const onPurchaseUpdate = () => {
    const editedItemId = editPurchase?.item._id;
    const { items } = _.cloneDeep(newPurchase);
    let index = 0;
    if (!editPurchase.cost || !editPurchase.quantity) {
      return;
    }
    items.map((item, i) => {
      if (item.item._id === editedItemId) {
        index = i;
        if (!editPurchase.cost) {
          editPurchase.cost = item.cost;
        }
        if (!editPurchase.quantity) {
          editPurchase.quantity = 1;
        }
      }
    });
    items.splice(index, 1, editPurchase);
    setPurchaseItems(items);
    setEditPurchase(undefined);
  };

  const onPurchaseItemRemove = (id: string) => {
    const { items } = _.cloneDeep(newPurchase);
    setPurchaseItems(items.filter((i) => i.item._id !== id));
  };

  const onEdit = (purchase: PurchaseItem, isEdit: boolean) => {
    if (!isEdit) {
      setEditPurchase(purchase);
    } else {
      true || onPurchaseEdit();
      onPurchaseUpdate();
      setUpdateSubmitted(true);
    }
  };

  return (
    <React.Fragment>
      <div className="card">
        <div className="card-header">
          <div className="card-title">{'New Purchase'}</div>
          <div className="card-options"></div>
        </div>
        <SuccessMessage message={message} />
        <ErrorMessage error={error} />
        <div className="card-body pb-0">
          <div className="row">
            <div className="col-md-4">
              <Input
                tabIndex={1}
                inputName="Vendor"
                inputLabel="Vendor"
                inputType="text"
                max={20}
                placeholderValue="Vendor Name"
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                  const vendor = e.target.value;
                  setNewPurchase((currentState) => ({
                    ...currentState,
                    vendor,
                  }));
                }}
                autoFocus={true}
                value={newPurchase?.vendor || ''}
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
                  setNewPurchase((currentState) => ({
                    ...currentState,
                    contact,
                  }));
                }}
                value={newPurchase?.contact || ''}
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
                  setNewPurchase((currentState) => ({
                    ...currentState,
                    email,
                  }));
                }}
                value={newPurchase?.email || ''}
              />
            </div>
          </div>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setNewItemSubmitted(true);
            if (!newPurchaseItem) {
              {
                return;
              }
            }
            if (!newPurchaseItem.quantity) {
              newPurchaseItem.quantity = 1;
              newPurchaseItem.total = newPurchaseItem.cost * 1;
            }
            if (!newPurchaseItem.cost) {
              newPurchaseItem.cost = newItem.price?.cost;
              newPurchaseItem.total =
                newItem.price?.cost * newPurchaseItem.quantity;
            }
            setNewItemSubmitted(false);
            setPurchaseItems((currentState) => [
              ...(currentState || []),
              newPurchaseItem,
            ]);
            setNewPurchaseItem(undefined);
            setNewItem(undefined);
            productSelectRef?.current?.focus();
          }}
        >
          <div className="card-body pt-0">
            <div className="row">
              <div className="col-md-4">
                <SelectBox
                  tabIndex={4}
                  selectLabel="Product"
                  selectData={itemsSelection?.filter((i) => {
                    const purchaseItemsIds = purchaseItems.map(
                      (s) => s.item._id,
                    );
                    return !purchaseItemsIds.includes(i.value);
                  })}
                  isDisabled={itemsLoading}
                  onSelectChange={(e: LabelValueObj) => {
                    const itemId = e.value;
                    const item = items.find((i) => i._id === itemId);
                    setNewItem(item);
                    setNewPurchaseItem({
                      item: item,
                      quantity: 1,
                      cost: item.price?.cost,
                      total: item.price?.cost,
                    });
                  }}
                  selectDefault={itemsSelection?.find(
                    (i) =>
                      i.value ===
                      ((newPurchaseItem?.item as unknown) as string),
                  )}
                  isInvalid={!!(newItemSubmitted && !newItem)}
                  noOptionsMessage={'Not in Stock'}
                  innerRef={productSelectRef}
                ></SelectBox>
              </div>
              <div className="col-md-2">
                <Input
                  tabIndex={5}
                  inputName="Purchase"
                  inputLabel="Purchase Price"
                  inputType="number"
                  max={20}
                  placeholderValue="Purchase Price"
                  onChange={(e: ChangeEvent<HTMLInputElement>) => {
                    const cost = Number(e.target.value);
                    setNewPurchaseItem((currentState) => ({
                      ...currentState,
                      cost,
                      total: currentState.quantity * cost,
                    }));
                  }}
                  disabled={itemsLoading || !newItem}
                  isInvalid={!!(newItemSubmitted && !newPurchaseItem?.cost)}
                  value={newPurchaseItem?.cost || ''}
                />
              </div>
              <div className="col-md-2">
                <Input
                  tabIndex={6}
                  inputName="Sale"
                  inputLabel="Sale Price"
                  inputType="number"
                  max={20}
                  placeholderValue="Sale Price"
                  onChange={(e: ChangeEvent<HTMLInputElement>) => {
                    const sale = Number(e.target.value);
                    setNewPurchaseItem((currentState) => ({
                      ...currentState,
                      sale,
                    }));
                  }}
                  disabled={itemsLoading || !newItem}
                  isInvalid={!!(newItemSubmitted && !newPurchaseItem?.sale)}
                  value={newPurchaseItem?.sale || ''}
                />
              </div>
              <div className="col-md-2">
                <Input
                  tabIndex={7}
                  inputName="quantity"
                  inputLabel="Quantity"
                  inputType="number"
                  max={20}
                  placeholderValue="Quantity"
                  onChange={(e: ChangeEvent<HTMLInputElement>) => {
                    const quantity = Number(e.target.value);
                    setNewPurchaseItem((currentState) => ({
                      ...currentState,
                      quantity,
                      total: newPurchaseItem?.cost * quantity,
                    }));
                  }}
                  disabled={createLoading || !newItem}
                  isInvalid={!!(newItemSubmitted && !newPurchaseItem?.quantity)}
                  value={newPurchaseItem?.quantity || ''}
                />
              </div>
              <div className="col-md-2">
                <Input
                  tabIndex={8}
                  inputName="total"
                  inputLabel="Total"
                  inputType="tel"
                  max={20}
                  placeholderValue="Total"
                  onChange={(e: ChangeEvent<HTMLInputElement>) => {
                    const total = Number(e.target.value);
                    setNewPurchaseItem((currentState) => ({
                      ...currentState,
                      total,
                    }));
                  }}
                  disabled={true}
                  isInvalid={!!(newItemSubmitted && !newPurchaseItem?.total)}
                  value={newPurchaseItem?.total || ''}
                />
              </div>
              <div className="col-md-2 ml-auto">
                <button
                  id="purchase-submit"
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
            <div className="p1 mb-2 text-muted">
              <i className="loss">
                * For any change in cost price of item, add new a item from
                Stock menu with new cost
              </i>
              <br />
              <i className="loss">
                * Changing Purchase price will create a new product with a new
                ID
              </i>
            </div>
          </div>
        </form>

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
              {(billNumber && purchaseLoading) || createLoading ? (
                <tr>
                  <td className={'text-center'} colSpan={6}>
                    <Loader />
                  </td>
                </tr>
              ) : (
                purchaseItems?.length === 0 && (
                  <tr>
                    <td className={'text-center'} colSpan={6}>
                      {'No Products added!'}
                    </td>
                  </tr>
                )
              )}
              {!createLoading &&
                !purchaseLoading &&
                purchaseItems?.length !== 0 && (
                  <React.Fragment>
                    {purchaseItems?.map((purchase: PurchaseItem, i: number) => {
                      const isEdit =
                        editPurchase?.item._id === purchase.item._id;
                      const item = purchase.item;
                      return (
                        <tr key={i}>
                          <td>{item.shortId}</td>
                          <td className="w-25">{item.name}</td>
                          <td
                            className="w-14"
                            onSubmit={(e) => {
                              e.preventDefault();
                              onEdit(purchase, isEdit);
                            }}
                          >
                            {
                              // isEdit ? (
                              //   <Input
                              //     tabIndex={11}
                              //     inputName="Purchase"
                              //     inputType="number"
                              //     max={10}
                              //     placeholderValue="Purchase Price"
                              //     onChange={(
                              //       e: ChangeEvent<HTMLInputElement>,
                              //     ) => {
                              //       const cost = Number(e.target.value);
                              //       setEditPurchase((currentState) => ({
                              //         ...currentState,
                              //         cost,
                              //         total: currentState.quantity * cost,
                              //       }));
                              //     }}
                              //     disabled={true || updateLoading}
                              //     isInvalid={
                              //       !!(updateSubmitted && !editPurchase?.cost)
                              //     }
                              //     value={editPurchase?.cost || ''}
                              //   />
                              // ) : (
                              purchase.cost
                              // )
                            }
                          </td>
                          <td className="w-14">
                            {isEdit ? (
                              <Input
                                tabIndex={12}
                                inputName="Quantity"
                                inputType="number"
                                max={10}
                                placeholderValue="Quantity"
                                onChange={(
                                  e: ChangeEvent<HTMLInputElement>,
                                ) => {
                                  const quantity = Number(e.target.value);
                                  setEditPurchase((currentState) => ({
                                    ...currentState,
                                    quantity,
                                    total: quantity * currentState.cost,
                                  }));
                                }}
                                disabled={updateLoading}
                                isInvalid={
                                  !!(updateSubmitted && !editPurchase?.quantity)
                                }
                                value={editPurchase?.quantity || ''}
                              />
                            ) : (
                              purchase.quantity
                            )}
                          </td>
                          <td>{purchase.total}</td>
                          <td className="w-14">
                            <button
                              onClick={() => onEdit(purchase, isEdit)}
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
                                  ? setEditPurchase(undefined)
                                  : onPurchaseItemRemove(purchase.item._id);
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
                        <strong>{newPurchase?.total}</strong>
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
              onClick={onNewPurchaseCreate}
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

export default AddPurchase;
