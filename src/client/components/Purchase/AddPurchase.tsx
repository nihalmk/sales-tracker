import React, { useState, ChangeEvent, useEffect, useRef } from 'react';
import { NextPage } from 'next';
import { useMutation, useQuery } from '@apollo/client';
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
import {
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

interface Props {
  billNumber?: string;
}

const AddPurchase: NextPage<Props> = function ({ billNumber }) {
  const productSelectRef = useRef<any>(null);

  const [submitCreatePurchase, { loading: createLoading }] =
    useMutation(CREATE_PURCHASE);
  const [submitUpdatePurchase, { loading: updateLoading }] =
    useMutation(UPDATE_PURCHASE);

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
            label: `#${i.shortId} | ${i.name} ${
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
      const purchaseItem = i as unknown as PurchaseItemInput;
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
      const purchaseItem = i as unknown as PurchaseItemInput;
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
      <Card.Root variant="elevated" borderRadius="l3" mb={5}>
        <Card.Header>
          <HStack gap={2}>
            <Icon name="newPurchase" boxSize={5} />
            <Heading size="md">New Purchase</Heading>
          </HStack>
        </Card.Header>
        <SuccessMessage message={message} />
        <ErrorMessage error={error} />
        <Card.Body pb={0}>
          <SimpleGrid columns={{ base: 1, md: 3 }} gap={4}>
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
          </SimpleGrid>
        </Card.Body>
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
          <Card.Body pt={0}>
            <SimpleGrid columns={{ base: 2, md: 12 }} gap={4} alignItems="end">
              <GridItem colSpan={{ base: 2, md: 3 }}>
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
                      i.value === (newPurchaseItem?.item as unknown as string),
                  )}
                  isInvalid={!!(newItemSubmitted && !newItem)}
                  noOptionsMessage={'Not in Stock'}
                  innerRef={productSelectRef}
                ></SelectBox>
              </GridItem>
              <GridItem colSpan={{ base: 1, md: 2 }}>
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
              </GridItem>
              <GridItem colSpan={{ base: 1, md: 2 }}>
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
              </GridItem>
              <GridItem colSpan={{ base: 1, md: 2 }}>
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
              </GridItem>
              <GridItem colSpan={{ base: 1, md: 1 }}>
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
              </GridItem>
              <GridItem colSpan={{ base: 2, md: 2 }}>
                <Button
                  id="purchase-submit"
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
            <Text fontSize="sm" color="red.600" mt={3}>
              * For any change in cost price of item, add new a item from Stock
              menu with new cost
              <br />* Changing Purchase price will create a new product with a
              new ID
            </Text>
          </Card.Body>
        </form>

        <Table.ScrollArea>
          <Table.Root variant="outline" size="sm" striped interactive>
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeader>#ID</Table.ColumnHeader>
                <Table.ColumnHeader>Product</Table.ColumnHeader>
                <Table.ColumnHeader textAlign="end">
                  Purchase Price
                </Table.ColumnHeader>
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
              {(billNumber && purchaseLoading) || createLoading ? (
                <Table.Row>
                  <Table.Cell textAlign="center" py={8} colSpan={6}>
                    <Loader />
                  </Table.Cell>
                </Table.Row>
              ) : (
                purchaseItems?.length === 0 && (
                  <Table.Row>
                    <Table.Cell textAlign="center" py={8} colSpan={6}>
                      <Text color="fg.muted" fontSize="sm">
                        No products added yet
                      </Text>
                    </Table.Cell>
                  </Table.Row>
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
                        <Table.Row key={i}>
                          <Table.Cell color="fg.muted">
                            {item.shortId}
                          </Table.Cell>
                          <Table.Cell fontWeight="medium">
                            {item.name}
                          </Table.Cell>
                          <Table.Cell
                            textAlign="end"
                            onSubmit={(e) => {
                              e.preventDefault();
                              onEdit(purchase, isEdit);
                            }}
                          >
                            {purchase.cost}
                          </Table.Cell>
                          <Table.Cell textAlign="end">
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
                          </Table.Cell>
                          <Table.Cell textAlign="end" fontWeight="semibold">
                            {purchase.total}
                          </Table.Cell>
                          <Table.Cell>
                            <HStack gap={2} justify="center">
                              <Button
                                size="xs"
                                minW="16"
                                colorPalette={isEdit ? 'green' : 'gray'}
                                variant={isEdit ? 'solid' : 'outline'}
                                loading={isEdit && updateLoading}
                                onClick={() => onEdit(purchase, isEdit)}
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
                                    ? setEditPurchase(undefined)
                                    : onPurchaseItemRemove(purchase.item._id);
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
                      <Table.Cell colSpan={4}>
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
                      <Table.Cell textAlign="end" fontWeight="bold">
                        {newPurchase?.total}
                      </Table.Cell>
                      <Table.Cell></Table.Cell>
                    </Table.Row>
                  </React.Fragment>
                )}
            </Table.Body>
          </Table.Root>
        </Table.ScrollArea>
        <Card.Footer>
          <HStack w="full">
            <Button asChild variant="outline" colorPalette="red">
              <Link href="/dashboard">
                <Icon name="cancel" />
                Cancel
              </Link>
            </Button>
            <Button
              colorPalette="brand"
              ml="auto"
              loading={createLoading}
              onClick={onNewPurchaseCreate}
            >
              <Icon name="done" light />
              Submit
            </Button>
          </HStack>
        </Card.Footer>
      </Card.Root>
    </React.Fragment>
  );
};

export default AddPurchase;
