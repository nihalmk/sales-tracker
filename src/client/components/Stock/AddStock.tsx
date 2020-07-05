import React, { useState, ChangeEvent, useEffect } from 'react';
import { NextPage } from 'next';
import { useMutation, useQuery } from '@apollo/react-hooks';
import { CREATE_ITEM, UPDATE_ITEM } from '../../graphql/mutation/items';
import { GET_ITEMS } from '../../graphql/query/items';
import Input from '../common/Inputs/FormInput';
import SuccessMessage from '../Alerts/SuccessMessage';
import ErrorMessage from '../Errors/ErrorMessage';
import _ from 'lodash';
import { Items } from '../../generated/graphql';
import Loader from '../Loaders/Loader';
import { removeUnderscoreKeys } from '../../utils/helpers';

interface Props {}

const AddStock: NextPage<Props> = function () {
  const [submitCreateItem, { loading: createLoading }] = useMutation(
    CREATE_ITEM,
  );
  const [submitUpdateItem, { loading: updateLoading }] = useMutation(
    UPDATE_ITEM,
  );

  const {
    loading: itemsLoading,
    data: itemsData,
    refetch: refetchItems,
  } = useQuery(GET_ITEMS, {
    fetchPolicy: 'no-cache',
  });

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [updateSubmitted, setUpdateSubmitted] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [items, setItems] = useState<Items[]>();

  useEffect(() => {
    if (searchTerm) {
      setItems(
        _.sortBy(
          itemsData?.getItemsForUser?.filter((p: Items) => {
            return (
              p.name.match(new RegExp(searchTerm, 'gi')) ||
              p.shortId.match(new RegExp(searchTerm, 'gi'))
            );
          }),
          'name',
        ),
      );
    } else {
      setItems(_.sortBy(itemsData?.getItemsForUser, 'name'));
    }
  }, [searchTerm, itemsData]);

  const [newItem, setNewItem] = useState<Items>();

  const [editItem, setEditItem] = useState<Items>();

  useEffect(() => {
    if (!newItem) {
      setNewItem({
        name: '',
        price: {
          cost: 0,
          sale: 0,
          list: 0,
        },
        stock: -1,
      } as Items);
    }
  });

  const onNewItemCreate = async (e?: React.SyntheticEvent) => {
    e && e.preventDefault();
    const { name, category, price, stock } = newItem || {};
    setSubmitted(true);
    if (
      !name ||
      price?.cost < 0 ||
      price?.list < 0 ||
      price?.sale < 0 ||
      stock < -1
    ) {
      setError('Please enter values for all fields');
      setTimeout(() => {
        setError('');
      }, 5000);
      return;
    }
    try {
      await submitCreateItem({
        variables: {
          name,
          category,
          price,
          stock,
        },
      });
      await refetchItems();
      setMessage('New item added successfully');
      setNewItem(undefined);
      setSubmitted(false);
      setTimeout(() => {
        setMessage('');
      }, 5000);
    } catch (e) {
      setError(`Error adding new item. ${e.message}`);
      setTimeout(() => {
        setError('');
      }, 5000);
    }
  };

  const onItemEdit = async (e?: React.SyntheticEvent) => {
    e && e.preventDefault();
    const { name, category, price, stock, _id } = editItem || {};
    setUpdateSubmitted(true);
    if (
      !name ||
      price?.cost < 0 ||
      price?.list < 0 ||
      price?.sale < 0 ||
      stock < -1
    ) {
      setError('Please enter values for all fields');
      setTimeout(() => {
        setError('');
      }, 5000);
      return;
    }
    try {
      await submitUpdateItem({
        variables: {
          _id,
          name,
          category,
          price: removeUnderscoreKeys(price),
          stock,
        },
      });
      await refetchItems();
      setEditItem(undefined);
      setMessage(`Item ${name} Updated successfully`);
      setTimeout(() => {
        setMessage('');
      }, 5000);
    } catch (e) {
      setError(`Error adding new item. ${e.message}`);
      setTimeout(() => {
        setError('');
      }, 5000);
    }
  };

  const getTotalStockAmount = () => {
    return _.sum(items?.map((i) => i.price?.cost * i.stock));
  };

  return (
    <React.Fragment>
      <div className="card">
        <div className="card-header">
          <div className="card-title">{'Stock'}</div>
          <div className="ml-auto">
            <strong>Total</strong>
            <div className="profit">{getTotalStockAmount()}₹</div>
          </div>
        </div>
        <form onSubmit={onNewItemCreate}>
          <div className="card-body">
            <div className="p1 mb-2 text-muted">
              <i>
                * For Service Charges, add -1 stock with 0 cost, 0 list and
                Service charges as sale price
              </i>
            </div>
            <div className="row">
              <div className="col-md-2">
                <Input
                  tabIndex={1}
                  inputName="name"
                  inputLabel="Name"
                  inputType="text"
                  max={50}
                  placeholderValue="Name"
                  onChange={(e: ChangeEvent<HTMLInputElement>) => {
                    const name = e.target.value;
                    setNewItem((currentState) => ({
                      ...currentState,
                      name: name,
                    }));
                  }}
                  disabled={createLoading}
                  isInvalid={!!(submitted && !newItem?.name)}
                  value={newItem?.name || ''}
                />
              </div>
              <div className="col-md-2">
                <Input
                  tabIndex={2}
                  inputName="cost"
                  inputLabel="Cost"
                  inputType="number"
                  max={20}
                  placeholderValue="Cost Price"
                  onChange={(e: ChangeEvent<HTMLInputElement>) => {
                    const cost = Number(e.target.value);
                    setNewItem((currentState) => ({
                      ...currentState,
                      price: {
                        ...currentState?.price,
                        cost,
                      },
                    }));
                  }}
                  disabled={createLoading}
                  isInvalid={!!(submitted && newItem?.price?.cost < 0)}
                  value={newItem?.price?.cost || 0}
                />
              </div>
              <div className="col-md-2">
                <Input
                  tabIndex={3}
                  inputName="list"
                  inputLabel="MRP"
                  inputType="number"
                  max={20}
                  placeholderValue="MRP"
                  onChange={(e: ChangeEvent<HTMLInputElement>) => {
                    const list = Number(e.target.value);
                    setNewItem((currentState) => ({
                      ...currentState,
                      price: {
                        ...currentState?.price,
                        list,
                      },
                    }));
                  }}
                  disabled={createLoading}
                  isInvalid={!!(submitted && newItem?.price?.list < 0)}
                  value={newItem?.price?.list || 0}
                />
              </div>
              <div className="col-md-2">
                <Input
                  tabIndex={4}
                  inputName="sale"
                  inputLabel="Sale"
                  inputType="number"
                  max={20}
                  placeholderValue="Sale Price"
                  onChange={(e: ChangeEvent<HTMLInputElement>) => {
                    const sale = Number(e.target.value);
                    setNewItem((currentState) => ({
                      ...currentState,
                      price: {
                        ...currentState?.price,
                        sale,
                      },
                    }));
                  }}
                  disabled={createLoading}
                  isInvalid={!!(submitted && newItem?.price?.sale < 0)}
                  value={newItem?.price?.sale || 0}
                />
              </div>
              <div className="col-md-2">
                <Input
                  tabIndex={5}
                  inputName="stock"
                  inputLabel="Stock"
                  inputType="number"
                  max={20}
                  placeholderValue="Stock Count"
                  onChange={(e: ChangeEvent<HTMLInputElement>) => {
                    const stock = Number(e.target.value);
                    setNewItem((currentState) => ({
                      ...currentState,
                      stock,
                    }));
                  }}
                  disabled={createLoading}
                  isInvalid={!!(submitted && !newItem?.stock)}
                  value={newItem?.stock}
                />
              </div>
              <div className="col-md-2">
                <label className="form-label">Add</label>
                <button
                  id="item-submit"
                  type="submit"
                  className={
                    'btn btn-primary ml-auto ' +
                    (createLoading && 'btn-loading')
                  }
                  onClick={onNewItemCreate}
                >
                  Add New Item
                </button>
              </div>
            </div>
            <button type="submit" hidden></button>
          </div>
        </form>
        <SuccessMessage message={message} />
        <ErrorMessage error={error} />
        <div className="card-header">
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
        </div>

        <div className="table-responsive">
          <table className="table card-table table-hover table-outline">
            <thead>
              <tr>
                <th className="w-10">#ID</th>
                <th className="w-25">Product</th>
                <th>Cost Price</th>
                <th>MRP</th>
                <th>Sale Price</th>
                <th>Stock</th>
                <th className="w-10">Action</th>
              </tr>
            </thead>
            <tbody>
              {itemsLoading ? (
                <tr>
                  <td className={'text-center'} colSpan={6}>
                    <Loader />
                  </td>
                </tr>
              ) : (
                items?.length === 0 && (
                  <tr>
                    <td className={'text-center'} colSpan={6}>
                      {'No Items added!'}
                    </td>
                  </tr>
                )
              )}
              {!itemsLoading &&
                items?.length != 0 &&
                items?.map((item: Items, i: number) => {
                  const isEdit = editItem?._id === item._id;
                  return (
                    <tr key={item._id + i}>
                      <td>{item.shortId}</td>
                      <td className="w-25">
                        {isEdit ? (
                          <Input
                            tabIndex={10}
                            inputName="name"
                            inputType="text"
                            max={50}
                            placeholderValue="Name"
                            onChange={(e: ChangeEvent<HTMLInputElement>) => {
                              const name = e.target.value;
                              setEditItem((currentState) => ({
                                ...currentState,
                                name: name,
                              }));
                            }}
                            disabled={updateLoading}
                            isInvalid={!!(updateSubmitted && !editItem?.name)}
                            value={editItem?.name || ''}
                          />
                        ) : (
                          item.name
                        )}
                      </td>
                      <td className="w-14">
                        {isEdit ? (
                          <Input
                            tabIndex={11}
                            inputName="Cost"
                            inputType="text"
                            max={10}
                            placeholderValue="Cost Price"
                            onChange={(e: ChangeEvent<HTMLInputElement>) => {
                              const cost = Number(e.target.value);
                              setEditItem((currentState) => ({
                                ...currentState,
                                price: {
                                  ...currentState.price,
                                  cost,
                                },
                              }));
                            }}
                            disabled={updateLoading}
                            isInvalid={
                              !!(updateSubmitted && !editItem?.price?.cost)
                            }
                            value={editItem?.price?.cost || ''}
                          />
                        ) : (
                          item.price?.cost
                        )}
                      </td>
                      <td className="w-14">
                        {isEdit ? (
                          <Input
                            tabIndex={12}
                            inputName="List"
                            inputType="text"
                            max={10}
                            placeholderValue="List Price"
                            onChange={(e: ChangeEvent<HTMLInputElement>) => {
                              const list = Number(e.target.value);
                              setEditItem((currentState) => ({
                                ...currentState,
                                price: {
                                  ...currentState.price,
                                  list,
                                },
                              }));
                            }}
                            disabled={updateLoading}
                            isInvalid={
                              !!(updateSubmitted && !editItem?.price?.list)
                            }
                            value={editItem?.price?.list || ''}
                          />
                        ) : (
                          item.price?.list
                        )}
                      </td>
                      <td>
                        {isEdit ? (
                          <Input
                            tabIndex={13}
                            inputName="Sale"
                            inputType="text"
                            max={10}
                            placeholderValue="Sale Price"
                            onChange={(e: ChangeEvent<HTMLInputElement>) => {
                              const sale = Number(e.target.value);
                              setEditItem((currentState) => ({
                                ...currentState,
                                price: {
                                  ...currentState.price,
                                  sale,
                                },
                              }));
                            }}
                            disabled={updateLoading}
                            isInvalid={
                              !!(updateSubmitted && !editItem?.price?.sale)
                            }
                            value={editItem?.price?.sale || ''}
                          />
                        ) : (
                          item.price?.sale
                        )}
                      </td>
                      <td>
                        {isEdit ? (
                          <Input
                            tabIndex={14}
                            inputName="Stock"
                            inputType="text"
                            max={10}
                            placeholderValue="Stock Count"
                            onChange={(e: ChangeEvent<HTMLInputElement>) => {
                              const stock = Number(e.target.value);
                              setEditItem((currentState) => ({
                                ...currentState,
                                stock,
                              }));
                            }}
                            disabled={updateLoading}
                            isInvalid={!!(updateSubmitted && !editItem?.stock)}
                            value={editItem?.stock || ''}
                          />
                        ) : (
                          item.stock
                        )}
                      </td>
                      <td>
                        <button
                          onClick={() => {
                            if (!isEdit) {
                              setEditItem(item);
                            } else {
                              onItemEdit();
                            }
                          }}
                          className={
                            'btn mr-2 ' +
                            (isEdit ? 'btn-success ' : 'btn-secondary ') +
                            (isEdit && updateLoading ? 'btn-loading' : '')
                          }
                        >
                          {isEdit ? 'Done' : 'Edit'}
                        </button>
                        {isEdit && (
                          <a
                            className="link"
                            onClick={() => {
                              setEditItem(undefined);
                            }}
                          >
                            X
                          </a>
                        )}
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>
      <style jsx>{`
        .w-10 {
          width: 10%;
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

export default AddStock;
