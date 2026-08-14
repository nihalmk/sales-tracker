import React, { useState, ChangeEvent, useEffect, useRef } from 'react';
import { NextPage } from 'next';
import { useMutation, useQuery } from '@apollo/client';
import { CREATE_SALE, UPDATE_SALE } from '../../graphql/mutation/sale';
import {
  GET_SALE_BY_BILL_NUMBER,
  GET_CUSTOMERS,
} from '../../graphql/query/sale';
import Input from '../common/Inputs/FormInput';
import SuccessMessage from '../Alerts/SuccessMessage';
import ErrorMessage from '../Errors/ErrorMessage';
import _ from 'lodash';
import { Sale, SaleItem, Items, SaleItemInput } from '../../generated/graphql';
import Loader from '../Loaders/Loader';
import { removeUnderscoreKeys } from '../../utils/helpers';
import SelectBox, { LabelValueObj } from '../common/SelectBoxes/SelectBox';
import { searchByLabelOrShortId } from '../common/SelectBoxes/searchByLabelOrShortId';
import ContactSelect from '../common/SelectBoxes/ContactSelect';
import { GET_ITEMS } from '../../graphql/query/items';
import Link from 'next/link';
import Sales from './Sales';
import moment from 'moment-timezone';
import {
  Box,
  Card,
  Heading,
  SimpleGrid,
  GridItem,
  Table,
  Button,
  HStack,
  Text,
} from '@chakra-ui/react';
import Icon from '../common/Icon';
import DiscountBanner from '../common/DiscountBanner';
import MissingMrpWarning, { MrpWarningItem } from '../common/MissingMrpWarning';

interface Props {
  billNumber?: string;
}

const AddSale: NextPage<Props> = function ({ billNumber }) {
  const productSelectRef = useRef<any>(null);

  const [submitCreateSale, { loading: createLoading }] =
    useMutation(CREATE_SALE);
  const [submitUpdateSale, { loading: updateLoading }] =
    useMutation(UPDATE_SALE);

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
  const [newItemSubmitted, setNewItemSubmitted] = useState(false);
  const [updateSubmitted, setUpdateSubmitted] = useState(false);
  const [showProfit, setShowProfit] = useState(false);

  const [newSale, setNewSale] = useState<Sale>();

  const [editSale, setEditSale] = useState<SaleItem>();

  const { loading: itemsLoading, data: itemsData } = useQuery(GET_ITEMS, {
    fetchPolicy: 'no-cache',
  });

  const { data: customersData } = useQuery(GET_CUSTOMERS, {
    fetchPolicy: 'no-cache',
  });

  const customerEntities = (customersData?.getCustomers || []).map(
    (c: { customer: string; contact?: string; email?: string }) => ({
      name: c.customer,
      contact: c.contact,
      email: c.email,
    }),
  );

  const onCustomerSelect = (
    entity: {
      name: string;
      contact?: string;
      email?: string;
      isNew?: boolean;
    } | null,
  ) => {
    if (!entity) {
      setNewSale((currentState) => ({ ...currentState, customer: '' }));
      return;
    }
    // A brand new name with no matching customer — leave contact/email as
    // the user already entered them.
    if (entity.isNew) {
      setNewSale((currentState) => ({
        ...currentState,
        customer: entity.name,
      }));
      return;
    }
    setNewSale((currentState) => ({
      ...currentState,
      customer: entity.name,
      contact: entity.contact || '',
      email: entity.email || '',
    }));
  };

  const [items, setItems] = useState<Items[]>();

  const [itemsSelection, setItemsSelection] = useState<LabelValueObj[]>();

  useEffect(() => {
    const sortedItems = _.sortBy(
      itemsData?.getItemsForUser?.items,
      'name',
    ) as Items[];
    setItemsSelection(
      _.compact(
        sortedItems.map((i) => {
          if (i.stock > 0 || i.stock === -1) {
            return {
              label: `#${i.shortId} | ${i.name} ${
                i.stock > 0 ? `(${i.price.cost}₹)` : ''
              }`,
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
      total -
      _.sum(
        items.map(
          (i) => (i.item?.price?.cost || i.item?.price?.list) * i.quantity,
        ),
      );
    const loss = profit < 0 ? Math.abs(profit) : 0;
    const discount =
      _.sum(items.map((i) => i.discount)) + (newSale.discount || 0);
    if (_.isEmpty(items)) {
      setError('Please enter values for all fields');
      setTimeout(() => {
        setError('');
      }, 5000);
      return;
    }
    const saleItems = _.cloneDeep(items).map((i) => {
      const saleItem = i as unknown as SaleItemInput;
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
      setNewItemSubmitted(false);
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
    const profit =
      total -
      _.sum(
        items.map(
          (i) => (i.item?.price?.cost || i.item?.price?.list) * i.quantity,
        ),
      );
    const loss = profit < 0 ? Math.abs(profit) : 0;
    const discount =
      _.sum(items.map((i) => i.discount)) + (newSale.discount || 0);
    setUpdateSubmitted(true);
    if (!_.isEmpty(items)) {
      setError('Please enter values for all fields');
      setTimeout(() => {
        setError('');
      }, 5000);
      return;
    }
    const saleItems = _.cloneDeep(items).map((i) => {
      const saleItem = i as unknown as SaleItemInput;
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

  const getProfitOrLoss = () => {
    const { items, total } = newSale || {};
    const profit =
      total -
      _.sum(
        items?.map(
          (i) => (i.item?.price?.cost || i.item?.price?.list) * i.quantity,
        ),
      );
    const loss = profit < 0 ? Math.abs(profit) : 0;
    return [profit, loss];
  };

  const getDiscountLineItems = () =>
    (saleItems || []).map((sale) => ({
      id: sale.item._id,
      name: sale.item.name,
      mrp: sale.item?.price?.list || 0,
      salePrice: sale.cost,
      quantity: sale.quantity,
    }));

  // Patches the fixed item's price everywhere it's referenced locally
  // (the stock lookup list and any line already added to this sale) so the
  // warning icon and discount math update immediately — no refetch or page
  // reload, so nothing already filled in on this form is lost.
  const onItemMrpUpdated = (updated: MrpWarningItem) => {
    setItems((current) =>
      current?.map((i) =>
        i._id === updated._id ? { ...i, price: updated.price } : i,
      ),
    );
    setSaleItems((current) =>
      current.map((si) =>
        si.item._id === updated._id
          ? { ...si, item: { ...si.item, price: updated.price } }
          : si,
      ),
    );
  };

  return (
    <React.Fragment>
      <Card.Root
        className="hide-in-print"
        variant="elevated"
        borderRadius="l3"
        mb={5}
      >
        <Card.Header>
          <HStack gap={2}>
            <Icon name="newSale" boxSize={5} />
            <Heading size="md">New Sale</Heading>
          </HStack>
        </Card.Header>
        <SuccessMessage message={message} />
        <ErrorMessage error={error} />
        <Card.Body pb={2}>
          <SimpleGrid columns={{ base: 1, md: 3 }} gap={4}>
            <ContactSelect
              tabIndex={1}
              label="Customer"
              placeholder="Customer Name"
              entities={customerEntities}
              value={newSale?.customer}
              onSelect={onCustomerSelect}
            />
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
              value={newSale?.contact || ''}
            />
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
              value={newSale?.email || ''}
            />
          </SimpleGrid>
        </Card.Body>
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
            productSelectRef?.current?.focus();
          }}
        >
          <Card.Body pt={0}>
            <SimpleGrid columns={{ base: 2, md: 12 }} gap={4} alignItems="end">
              <GridItem colSpan={{ base: 2, md: 6 }}>
                <SelectBox
                  tabIndex={4}
                  selectLabel="Product"
                  selectData={itemsSelection?.filter((i) => {
                    const saleItemsIds = saleItems.map((s) => s.item._id);
                    return !saleItemsIds.includes(i.value);
                  })}
                  isDisabled={itemsLoading}
                  isClearable
                  filterOption={searchByLabelOrShortId}
                  onSelectChange={(e: LabelValueObj | null) => {
                    if (!e) {
                      setNewItem(undefined);
                      setNewSaleItem(undefined);
                      return;
                    }
                    const itemId = e.value;
                    const item = items.find((i) => i._id === itemId);
                    setNewItem(item);
                    setNewSaleItem({
                      item: item,
                      quantity: 1,
                      discount: 0,
                      cost: item.price?.sale || item.price?.list,
                      total: item.price?.sale || item.price?.list,
                    });
                  }}
                  selectDefault={itemsSelection?.find(
                    (i) => i.value === (newSaleItem?.item as unknown as string),
                  )}
                  isInvalid={!!(newItemSubmitted && !newItem)}
                  noOptionsMessage={'Not in Stock'}
                  innerRef={productSelectRef}
                ></SelectBox>
              </GridItem>
              <GridItem colSpan={{ base: 1, md: 2 }}>
                <Input
                  tabIndex={5}
                  inputName="Sale"
                  inputLabel="Sale Price"
                  inputType="number"
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
              </GridItem>
              <GridItem colSpan={{ base: 1, md: 1 }}>
                <Input
                  tabIndex={6}
                  inputName="quantity"
                  inputLabel="Quantity"
                  inputType="number"
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
              </GridItem>
              <GridItem colSpan={{ base: 1, md: 1 }}>
                <Input
                  tabIndex={7}
                  inputName="total"
                  inputLabel="Total"
                  inputType="number"
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
              </GridItem>
              <GridItem colSpan={{ base: 2, md: 2 }}>
                <Button
                  id="sale-submit"
                  type="submit"
                  colorPalette="brand"
                  w="full"
                  loading={createLoading}
                >
                  <Icon name="add" light />
                  Add New Item
                </Button>
              </GridItem>
            </SimpleGrid>
          </Card.Body>
        </form>

        <Table.ScrollArea>
          <Table.Root variant="outline" size="sm" striped interactive>
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeader>#ID</Table.ColumnHeader>
                <Table.ColumnHeader>Product</Table.ColumnHeader>
                <Table.ColumnHeader textAlign="end">
                  Sale Price
                </Table.ColumnHeader>
                <Table.ColumnHeader textAlign="end">MRP</Table.ColumnHeader>
                <Table.ColumnHeader textAlign="end">
                  Quantity
                </Table.ColumnHeader>
                <Table.ColumnHeader textAlign="end">Total</Table.ColumnHeader>
                <Table.ColumnHeader textAlign="center">
                  Action
                </Table.ColumnHeader>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {(billNumber && saleLoading) || createLoading ? (
                <Table.Row>
                  <Table.Cell textAlign="center" py={8} colSpan={7}>
                    <Loader />
                  </Table.Cell>
                </Table.Row>
              ) : (
                saleItems?.length === 0 && (
                  <Table.Row>
                    <Table.Cell textAlign="center" py={8} colSpan={7}>
                      <Text color="fg.muted" fontSize="sm">
                        No products added yet
                      </Text>
                    </Table.Cell>
                  </Table.Row>
                )
              )}
              {!createLoading && !saleLoading && saleItems?.length !== 0 && (
                <React.Fragment>
                  {saleItems?.map((sale: SaleItem, i: number) => {
                    const isEdit = editSale?.item._id === sale.item._id;
                    const profit = sale.cost - sale.item?.price?.cost;
                    const isProfit = profit > 0;
                    const item = sale.item;
                    return (
                      <Table.Row key={i}>
                        <Table.Cell color="fg.muted">{item.shortId}</Table.Cell>
                        <Table.Cell fontWeight="medium">
                          {item.name}
                          <MissingMrpWarning
                            item={item}
                            fallbackPrice={sale.cost}
                            onUpdated={onItemMrpUpdated}
                          />
                        </Table.Cell>
                        <Table.Cell
                          textAlign="end"
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
                            <Text
                              as="span"
                              color="blue.600"
                              fontWeight="medium"
                            >
                              {sale.cost}
                            </Text>
                          )}
                        </Table.Cell>
                        <Table.Cell textAlign="end" color="gray.500">
                          {item.price?.list || '-'}
                        </Table.Cell>
                        <Table.Cell textAlign="end">
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
                        </Table.Cell>
                        <Table.Cell
                          textAlign="end"
                          fontWeight="semibold"
                          color="purple.700"
                        >
                          {sale.total}
                          {showProfit ? (
                            <Box
                              as="span"
                              ml={2}
                              color={isProfit ? 'green.600' : 'red.600'}
                              fontWeight="medium"
                            >
                              {isProfit && '+'}
                              {profit}
                            </Box>
                          ) : (
                            ''
                          )}
                        </Table.Cell>
                        <Table.Cell>
                          <HStack gap={2} justify="center">
                            <Button
                              size="xs"
                              minW="16"
                              colorPalette={isEdit ? 'green' : 'gray'}
                              variant={isEdit ? 'solid' : 'outline'}
                              loading={isEdit && updateLoading}
                              onClick={() => onEdit(sale, isEdit)}
                            >
                              {isEdit ? 'Done' : 'Edit'}
                            </Button>
                            <Button
                              size="xs"
                              minW="16"
                              variant="ghost"
                              colorPalette={isEdit ? 'gray' : 'red'}
                              onClick={() => {
                                isEdit
                                  ? setEditSale(undefined)
                                  : onSaleItemRemove(sale.item._id);
                              }}
                            >
                              {isEdit ? 'Cancel' : 'Remove'}
                            </Button>
                          </HStack>
                        </Table.Cell>
                      </Table.Row>
                    );
                  })}
                  <Table.Row
                    bg="gray.50"
                    borderTopWidth="2px"
                    borderTopColor="gray.300"
                  >
                    <Table.Cell colSpan={5}>
                      <Text
                        fontWeight="bold"
                        fontSize="xs"
                        textTransform="uppercase"
                        letterSpacing="wider"
                        color="gray.600"
                      >
                        Total
                      </Text>
                    </Table.Cell>
                    <Table.Cell
                      textAlign="end"
                      fontWeight="bold"
                      color="purple.700"
                    >
                      {newSale?.total}
                    </Table.Cell>
                    <Table.Cell>
                      {showProfit && (
                        <Box
                          as="span"
                          color={
                            getProfitOrLoss()[0] < 0 ? 'red.600' : 'green.600'
                          }
                          fontWeight="bold"
                        >
                          {getProfitOrLoss()[0] > 0 ? '+' : ''}
                          {getProfitOrLoss()[0]}
                        </Box>
                      )}
                    </Table.Cell>
                  </Table.Row>
                </React.Fragment>
              )}
            </Table.Body>
          </Table.Root>
        </Table.ScrollArea>
        {saleItems?.length > 0 && (
          <Card.Body pt={1}>
            <DiscountBanner items={getDiscountLineItems()} />
          </Card.Body>
        )}
        <Card.Footer pt={2}>
          <HStack w="full">
            <Button asChild variant="outline" colorPalette="red">
              <Link href="/dashboard">
                <Icon name="cancel" />
                Cancel
              </Link>
            </Button>
            <Button
              colorPalette="gray"
              variant="outline"
              ml="auto"
              onClick={() => setShowProfit(!showProfit)}
            >
              {showProfit ? 'Hide P/L' : 'P/L'}
            </Button>
            <Button
              colorPalette="brand"
              loading={createLoading}
              onClick={onNewSaleCreate}
            >
              <Icon name="done" light />
              Submit
            </Button>
          </HStack>
        </Card.Footer>
      </Card.Root>
      <HStack className="hide-in-print" mb={3} gap={2}>
        <Icon name="sales" boxSize={5} />
        <Heading size="md">Today's Sales</Heading>
      </HStack>
      {createLoading ? <Loader /> : <Sales saleDateFrom={moment().toDate()} />}
    </React.Fragment>
  );
};

export default AddSale;
