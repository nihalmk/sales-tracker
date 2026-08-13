import React, { useState, ChangeEvent, useEffect } from 'react';
import { NextPage } from 'next';
import { useMutation, useQuery } from '@apollo/client';
import { CREATE_ITEM, UPDATE_ITEM } from '../../graphql/mutation/items';
import { GET_ITEMS } from '../../graphql/query/items';
import Input from '../common/Inputs/FormInput';
import SuccessMessage from '../Alerts/SuccessMessage';
import ErrorMessage from '../Errors/ErrorMessage';
import { Items } from '../../generated/graphql';
import Loader from '../Loaders/Loader';
import { removeUnderscoreKeys } from '../../utils/helpers';
import {
  Card,
  Heading,
  Text,
  SimpleGrid,
  GridItem,
  Table,
  Button,
  HStack,
} from '@chakra-ui/react';
import Icon from '../common/Icon';

const PAGE_SIZE = 10;
const SEARCH_DEBOUNCE_MS = 1000;
const SEARCH_MIN_LENGTH = 2;

interface Props {}

const AddStock: NextPage<Props> = function () {
  const [submitCreateItem, { loading: createLoading }] =
    useMutation(CREATE_ITEM);
  const [submitUpdateItem, { loading: updateLoading }] =
    useMutation(UPDATE_ITEM);

  // searchTerm tracks the input as typed, so the field itself stays
  // responsive. appliedSearch only updates 2s after typing stops, and only
  // once there are at least 2 characters — that's what actually drives the
  // query, so short/mid-word keystrokes don't fire a search each time.
  const [searchTerm, setSearchTerm] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAppliedSearch(
        searchTerm.length >= SEARCH_MIN_LENGTH ? searchTerm : '',
      );
      setPage(1);
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const {
    loading: itemsLoading,
    data: itemsData,
    refetch: refetchItems,
  } = useQuery(GET_ITEMS, {
    variables: {
      search: appliedSearch || undefined,
      page,
      limit: PAGE_SIZE,
    },
    fetchPolicy: 'no-cache',
  });

  const items: Items[] = itemsData?.getItemsForUser?.items || [];
  const totalCount = itemsData?.getItemsForUser?.totalCount || 0;
  const totalStockAmount = itemsData?.getItemsForUser?.totalStockAmount || 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [updateSubmitted, setUpdateSubmitted] = useState(false);

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
        stock: 0,
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

  return (
    <React.Fragment>
      <Card.Root variant="elevated" borderRadius="l3" mb={5}>
        <Card.Header>
          <HStack justify="space-between">
            <HStack gap={2}>
              <Icon name="stock" boxSize={5} />
              <Heading size="md">Stock</Heading>
            </HStack>
            <Text textAlign="right">
              <Text as="span" fontWeight="semibold" mr={2}>
                Total
              </Text>
              <Text as="span" color="green.600" fontWeight="medium">
                {totalStockAmount}₹
              </Text>
            </Text>
          </HStack>
        </Card.Header>
        <form onSubmit={onNewItemCreate}>
          <Card.Body>
            <Text fontSize="sm" color="fg.muted" mb={3}>
              * For Service Charges, add -1 stock with 0 cost, 0 list and
              Service charges as sale price
            </Text>
            <SimpleGrid columns={{ base: 2, md: 12 }} gap={4} alignItems="end">
              <GridItem colSpan={{ base: 1, md: 2 }}>
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
              </GridItem>
              <GridItem colSpan={{ base: 1, md: 2 }}>
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
              </GridItem>
              <GridItem colSpan={{ base: 1, md: 2 }}>
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
              </GridItem>
              <GridItem colSpan={{ base: 1, md: 2 }}>
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
              </GridItem>
              <GridItem colSpan={{ base: 1, md: 2 }}>
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
              </GridItem>
              <GridItem colSpan={{ base: 2, md: 2 }}>
                <Button
                  id="item-submit"
                  type="submit"
                  colorPalette="brand"
                  w="full"
                  loading={createLoading}
                  onClick={onNewItemCreate}
                >
                  <Icon name="add" light />
                  Add New Item
                </Button>
              </GridItem>
            </SimpleGrid>
            <button type="submit" hidden></button>
          </Card.Body>
        </form>
        <SuccessMessage message={message} />
        <ErrorMessage error={error} />
        <Card.Body pt={0} pb={4}>
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
        </Card.Body>

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
                  Sale Price
                </Table.ColumnHeader>
                <Table.ColumnHeader textAlign="end">Stock</Table.ColumnHeader>
                <Table.ColumnHeader textAlign="center">
                  Action
                </Table.ColumnHeader>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {itemsLoading ? (
                <Table.Row>
                  <Table.Cell textAlign="center" py={8} colSpan={7}>
                    <Loader />
                  </Table.Cell>
                </Table.Row>
              ) : (
                items?.length === 0 && (
                  <Table.Row>
                    <Table.Cell textAlign="center" py={8} colSpan={7}>
                      <Text color="fg.muted" fontSize="sm">
                        No items added yet
                      </Text>
                    </Table.Cell>
                  </Table.Row>
                )
              )}
              {!itemsLoading &&
                items?.length != 0 &&
                items?.map((item: Items, i: number) => {
                  const isEdit = editItem?._id === item._id;
                  const isOutOfStock = item.stock === 0;
                  const isLowStock = item.stock > 0 && item.stock <= 5;
                  return (
                    <Table.Row key={item._id + i}>
                      <Table.Cell color="fg.muted">{item.shortId}</Table.Cell>
                      <Table.Cell fontWeight="medium">
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
                      </Table.Cell>
                      <Table.Cell textAlign="end">
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
                      </Table.Cell>
                      <Table.Cell textAlign="end">
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
                      </Table.Cell>
                      <Table.Cell textAlign="end">
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
                      </Table.Cell>
                      <Table.Cell textAlign="end">
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
                          <Text
                            as="span"
                            fontWeight={
                              isOutOfStock || isLowStock ? 'semibold' : 'normal'
                            }
                            color={
                              isOutOfStock
                                ? 'red.600'
                                : isLowStock
                                  ? 'orange.500'
                                  : undefined
                            }
                          >
                            {item.stock}
                            {isOutOfStock && ' · Out of stock'}
                            {isLowStock && ' · Low'}
                          </Text>
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
                            onClick={() => {
                              if (!isEdit) {
                                setEditItem(item);
                              } else {
                                onItemEdit();
                              }
                            }}
                          >
                            {isEdit ? 'Done' : 'Edit'}
                          </Button>
                          {isEdit && (
                            <Button
                              size="xs"
                              minW="16"
                              variant="ghost"
                              colorPalette="gray"
                              onClick={() => {
                                setEditItem(undefined);
                              }}
                            >
                              Cancel
                            </Button>
                          )}
                        </HStack>
                      </Table.Cell>
                    </Table.Row>
                  );
                })}
            </Table.Body>
          </Table.Root>
        </Table.ScrollArea>
        {totalCount > PAGE_SIZE && (
          <Card.Body pt={0}>
            <HStack justify="center" gap={4}>
              <Button
                size="sm"
                variant="outline"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                Previous
              </Button>
              <Text fontSize="sm" color="fg.muted">
                Page {page} of {totalPages}
              </Text>
              <Button
                size="sm"
                variant="outline"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </HStack>
          </Card.Body>
        )}
      </Card.Root>
    </React.Fragment>
  );
};

export default AddStock;
