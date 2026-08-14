import React, { useState, ChangeEvent, useEffect, useRef } from 'react';
import { NextPage } from 'next';
import { useMutation, useQuery } from '@apollo/client';
import {
  CREATE_PURCHASE,
  UPDATE_PURCHASE,
} from '../../graphql/mutation/purchase';
import {
  GET_PURCHASE_BY_BILL_NUMBER,
  GET_VENDORS,
} from '../../graphql/query/purchase';
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
import { LabelValueObj } from '../common/SelectBoxes/SelectBox';
import CreatableSelect from '../common/SelectBoxes/CreatableSelect';
import { searchByLabelOrShortId } from '../common/SelectBoxes/searchByLabelOrShortId';
import ContactSelect from '../common/SelectBoxes/ContactSelect';
import { GET_ITEMS, GET_CATEGORIES } from '../../graphql/query/items';
import { CREATE_ITEM } from '../../graphql/mutation/items';
import Link from 'next/link';
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
import OverLay from '../OverLay';
import Tooltip from '../common/Tooltip';

interface Props {
  billNumber?: string;
  // Present when embedded inline inside an existing Purchase card for
  // editing — Cancel/Submit call these instead of navigating away.
  onCancel?: () => void;
  onSaved?: () => void;
}

interface ProductOption extends LabelValueObj {
  shortId: string;
  cost: number;
  stock: number;
}

const AddPurchase: NextPage<Props> = function ({
  billNumber,
  onCancel,
  onSaved,
}) {
  const productSelectRef = useRef<any>(null);

  const [submitCreatePurchase, { loading: createLoading }] =
    useMutation(CREATE_PURCHASE);
  const [submitUpdatePurchase, { loading: updateLoading }] =
    useMutation(UPDATE_PURCHASE);
  const [submitCreateItem, { loading: createItemLoading }] =
    useMutation(CREATE_ITEM);

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
  const [newItemSubmitted, setNewItemSubmitted] = useState(false);
  const [updateSubmitted, setUpdateSubmitted] = useState(false);

  const [newPurchase, setNewPurchase] = useState<Purchase>();

  const [editPurchase, setEditPurchase] = useState<PurchaseItem>();

  const { loading: itemsLoading, data: itemsData } = useQuery(GET_ITEMS, {
    fetchPolicy: 'no-cache',
  });

  const { data: categoriesData } = useQuery(GET_CATEGORIES, {
    fetchPolicy: 'no-cache',
  });
  const categoryOptions: LabelValueObj[] = (
    categoriesData?.getCategories || []
  ).map((c: string) => ({ label: c, value: c }));

  const { data: vendorsData } = useQuery(GET_VENDORS, {
    fetchPolicy: 'no-cache',
  });

  const vendorEntities = (vendorsData?.getVendors || []).map(
    (v: { vendor: string; contact?: string; email?: string }) => ({
      name: v.vendor,
      contact: v.contact,
      email: v.email,
    }),
  );

  const onVendorSelect = (
    entity: {
      name: string;
      contact?: string;
      email?: string;
      isNew?: boolean;
    } | null,
  ) => {
    if (!entity) {
      setNewPurchase((currentState) => ({ ...currentState, vendor: '' }));
      return;
    }
    // A brand new name with no matching vendor — leave contact/email as the
    // user already entered them.
    if (entity.isNew) {
      setNewPurchase((currentState) => ({
        ...currentState,
        vendor: entity.name,
      }));
      return;
    }
    setNewPurchase((currentState) => ({
      ...currentState,
      vendor: entity.name,
      contact: entity.contact || '',
      email: entity.email || '',
    }));
  };

  const [items, setItems] = useState<Items[]>();

  const [itemsSelection, setItemsSelection] = useState<ProductOption[]>();

  // Plain item name as the option label (used for matching typed text
  // against existing options, so CreatableSelect only offers "Create X"
  // when X genuinely doesn't exist) — the richer #shortId/cost display
  // lives in renderProductOption below via customOption.
  const toProductOption = (i: Items): ProductOption => ({
    label: i.name,
    value: i._id,
    shortId: i.shortId,
    cost: i.price?.cost,
    stock: i.stock,
  });

  useEffect(() => {
    const sortedItems = _.sortBy(
      itemsData?.getItemsForUser?.items,
      'name',
    ) as Items[];
    setItemsSelection(_.compact(sortedItems.map(toProductOption)));
    setItems(sortedItems);
  }, [itemsData]);

  const renderProductOption = (option: ProductOption) => (
    <Text>
      #{option.shortId} | {option.label}{' '}
      {option.stock > 0 ? `(${option.cost}₹)` : ''}
    </Text>
  );

  const [purchaseItems, setPurchaseItems] = useState<PurchaseItem[]>([]);
  const [newPurchaseItem, setNewPurchaseItem] = useState<PurchaseItem>();
  const [newItem, setNewItem] = useState<Items>();

  // New-item-inline-creation modal state — lets a purchase in progress
  // create a product on the fly instead of navigating to Stock and losing
  // everything already entered on this form.
  const [newItemModalOpen, setNewItemModalOpen] = useState(false);
  const [pendingItemName, setPendingItemName] = useState('');
  const [newItemDraft, setNewItemDraft] = useState<{
    category?: string;
    cost?: number;
    list?: number;
  }>({});
  const [newItemDraftSubmitted, setNewItemDraftSubmitted] = useState(false);
  const [newItemError, setNewItemError] = useState('');

  const resetNewItemModal = () => {
    setNewItemModalOpen(false);
    setPendingItemName('');
    setNewItemDraft({});
    setNewItemDraftSubmitted(false);
    setNewItemError('');
  };

  const onCreateNewItem = async () => {
    setNewItemDraftSubmitted(true);
    if (!(newItemDraft.cost >= 0) || !(newItemDraft.list >= 0)) {
      setNewItemError('Please enter cost and MRP');
      return;
    }
    try {
      const res = await submitCreateItem({
        variables: {
          name: pendingItemName,
          category: newItemDraft.category || undefined,
          price: {
            cost: newItemDraft.cost,
            list: newItemDraft.list,
            sale: newItemDraft.list,
          },
          stock: 0,
        },
      });
      const created = res.data.createItem as Items;
      const updatedItems = _.sortBy([...(items || []), created], 'name');
      setItems(updatedItems);
      setItemsSelection(updatedItems.map(toProductOption));
      setNewItem(created);
      setNewPurchaseItem({
        item: created,
        quantity: 1,
        cost: created.price?.cost,
        sale: created.price?.sale,
        list: created.price?.list,
        total: created.price?.cost,
      });
      resetNewItemModal();
      productSelectRef?.current?.focus();
    } catch (e) {
      setNewItemError(`Error creating item. ${e.message}`);
    }
  };

  useEffect(() => {
    const existingPurchase = purchaseData?.getPurchaseByBillNumber?.[0];
    setPurchaseItems(existingPurchase?.items || []);
    // Seed the fields the edit form doesn't derive from `items` — most
    // importantly `_id`, which `onPurchaseEdit` sends as a required mutation
    // variable; omitting it here means the update mutation would be sent
    // with `_id: undefined`, which Apollo drops from the request entirely.
    if (existingPurchase) {
      setNewPurchase((currentState) => ({
        ...currentState,
        _id: existingPurchase._id,
        vendor: existingPurchase.vendor,
        contact: existingPurchase.contact,
        email: existingPurchase.email,
      }));
    }
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
      setUpdateSubmitted(false);
      setMessage('Purchase updated successfully');
      onSaved?.();
      setTimeout(() => {
        setMessage('');
      }, 5000);
    } catch (e) {
      setError(`Error updating purchase. ${e.message}`);
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
            <Heading size="md">
              {billNumber ? `Edit Purchase #${billNumber}` : 'New Purchase'}
            </Heading>
          </HStack>
        </Card.Header>
        <SuccessMessage message={message} />
        <ErrorMessage error={error} />
        <Card.Body pb={2}>
          <SimpleGrid columns={{ base: 1, md: 3 }} gap={4}>
            <ContactSelect
              tabIndex={1}
              label="Vendor"
              placeholder="Vendor Name"
              entities={vendorEntities}
              value={newPurchase?.vendor}
              onSelect={onVendorSelect}
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
              <GridItem colSpan={{ base: 2, md: 6 }}>
                <CreatableSelect
                  tabIndex={4}
                  selectLabel="Product"
                  options={itemsSelection?.filter((i) => {
                    const purchaseItemsIds = purchaseItems.map(
                      (s) => s.item._id,
                    );
                    return !purchaseItemsIds.includes(i.value);
                  })}
                  isDisabled={itemsLoading}
                  isLoading={itemsLoading}
                  isClearable
                  filterOption={searchByLabelOrShortId}
                  customOption={renderProductOption}
                  onChange={(
                    picked: (ProductOption & { __isNew__?: boolean }) | null,
                  ) => {
                    if (!picked) {
                      setNewItem(undefined);
                      setNewPurchaseItem(undefined);
                      return;
                    }
                    if (picked.__isNew__) {
                      setPendingItemName(picked.value);
                      setNewItemDraft({});
                      setNewItemDraftSubmitted(false);
                      setNewItemError('');
                      setNewItemModalOpen(true);
                      return;
                    }
                    const itemId = picked.value;
                    const item = items.find((i) => i._id === itemId);
                    setNewItem(item);
                    setNewPurchaseItem({
                      item: item,
                      quantity: 1,
                      cost: item.price?.cost,
                      sale: item.price?.sale,
                      list: item.price?.list,
                      total: item.price?.cost,
                    });
                  }}
                  value={itemsSelection?.find(
                    (i) =>
                      i.value === (newPurchaseItem?.item as unknown as string),
                  )}
                  isInvalid={!!(newItemSubmitted && !newItem)}
                  noOptionsMessage={'Not in Stock'}
                  innerRef={productSelectRef}
                />
              </GridItem>
              <GridItem colSpan={{ base: 1, md: 2 }}>
                <Input
                  tabIndex={5}
                  inputName="Cost"
                  inputLabel="Cost Price"
                  inputType="number"
                  max={20}
                  placeholderValue="Cost Price"
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
                <Tooltip content="MRP can't be changed here — create this as a new product instead if the MRP needs to change.">
                  <Box>
                    <Input
                      tabIndex={6}
                      inputName="list"
                      inputLabel="MRP"
                      inputType="number"
                      max={20}
                      placeholderValue="MRP"
                      onChange={() => {}}
                      disabled
                      value={newPurchaseItem?.list || ''}
                    />
                  </Box>
                </Tooltip>
              </GridItem>
              <GridItem colSpan={{ base: 1, md: 2 }}>
                <Input
                  tabIndex={7}
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
              <GridItem colSpan={{ base: 1, md: 1 }}>
                <Input
                  tabIndex={8}
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
                  tabIndex={9}
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
              menu/Create new item with new cost
              <br />* Changing Cost price will create a new product with a new
              ID
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
                  Cost Price
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
              {(billNumber && purchaseLoading) || createLoading ? (
                <Table.Row>
                  <Table.Cell textAlign="center" py={8} colSpan={7}>
                    <Loader />
                  </Table.Cell>
                </Table.Row>
              ) : (
                purchaseItems?.length === 0 && (
                  <Table.Row>
                    <Table.Cell textAlign="center" py={8} colSpan={7}>
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
                            <Text
                              as="span"
                              color="blue.600"
                              fontWeight="medium"
                            >
                              {purchase.cost}
                            </Text>
                          </Table.Cell>
                          <Table.Cell textAlign="end" color="gray.500">
                            {purchase.list || item.price?.list || '-'}
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
                          <Table.Cell
                            textAlign="end"
                            fontWeight="semibold"
                            color="purple.700"
                          >
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
            {onCancel ? (
              <Button variant="outline" colorPalette="red" onClick={onCancel}>
                <Icon name="cancel" />
                Cancel
              </Button>
            ) : (
              <Button asChild variant="outline" colorPalette="red">
                <Link href="/dashboard">
                  <Icon name="cancel" />
                  Cancel
                </Link>
              </Button>
            )}
            <Button
              colorPalette="brand"
              ml="auto"
              loading={billNumber ? updateLoading : createLoading}
              onClick={billNumber ? onPurchaseEdit : onNewPurchaseCreate}
            >
              <Icon name="done" light />
              Submit
            </Button>
          </HStack>
        </Card.Footer>
      </Card.Root>
      <OverLay show={newItemModalOpen}>
        <Card.Root mb={0} variant="elevated">
          <Card.Header>
            <Heading size="md">Create &quot;{pendingItemName}&quot;</Heading>
          </Card.Header>
          <Card.Body>
            <ErrorMessage error={newItemError} />
            <SimpleGrid columns={{ base: 1, md: 3 }} gap={4}>
              <CreatableSelect
                selectLabel="Category"
                options={categoryOptions}
                placeholder="Category (optional)"
                isClearable
                onChange={(picked: LabelValueObj | null) => {
                  setNewItemDraft((currentState) => ({
                    ...currentState,
                    category: picked?.value || '',
                  }));
                }}
                value={
                  newItemDraft.category
                    ? {
                        label: newItemDraft.category,
                        value: newItemDraft.category,
                      }
                    : null
                }
              />
              <Input
                inputName="Cost"
                inputLabel="Cost Price"
                inputType="number"
                max={20}
                placeholderValue="Cost Price"
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                  const cost = Number(e.target.value);
                  setNewItemDraft((currentState) => ({
                    ...currentState,
                    cost,
                  }));
                }}
                isInvalid={
                  !!(newItemDraftSubmitted && !(newItemDraft.cost >= 0))
                }
                value={newItemDraft.cost ?? ''}
              />
              <Input
                inputName="MRP"
                inputLabel="MRP"
                inputType="number"
                max={20}
                placeholderValue="MRP"
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                  const list = Number(e.target.value);
                  setNewItemDraft((currentState) => ({
                    ...currentState,
                    list,
                  }));
                }}
                isInvalid={
                  !!(newItemDraftSubmitted && !(newItemDraft.list >= 0))
                }
                value={newItemDraft.list ?? ''}
              />
            </SimpleGrid>
          </Card.Body>
          <Card.Footer>
            <HStack w="full">
              <Button
                variant="outline"
                colorPalette="red"
                onClick={resetNewItemModal}
              >
                <Icon name="cancel" />
                Cancel
              </Button>
              <Button
                colorPalette="brand"
                ml="auto"
                loading={createItemLoading}
                onClick={onCreateNewItem}
              >
                <Icon name="add" light />
                Create &amp; Select
              </Button>
            </HStack>
          </Card.Footer>
        </Card.Root>
      </OverLay>
    </React.Fragment>
  );
};

export default AddPurchase;
