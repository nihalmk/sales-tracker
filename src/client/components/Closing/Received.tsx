import React, { useState, ChangeEvent, useEffect, useRef } from 'react';
import { NextPage } from 'next';
import _ from 'lodash';
import { ReceivedItemsInput } from '../../generated/graphql';
import Input from '../common/Inputs/FormInput';
import { Table, Button, SimpleGrid, GridItem, Text } from '@chakra-ui/react';
import Icon from '../common/Icon';

interface Props {
  receivedItemsList?: ReceivedItemsInput[];
  callback?: (receivedItems: ReceivedItemsInput[]) => void;
  isView?: boolean;
  id: string;
}

export const Received: NextPage<Props> = function ({
  receivedItemsList,
  callback,
  isView,
  id,
}) {
  const [receivedItems, setReceivedItems] = useState(receivedItemsList || []);
  const [newReceivedItem, setNewReceivedItem] = useState<ReceivedItemsInput>();
  const [submitted, setIsSubmitted] = useState(false);
  const formFocus = useRef<any>(null);

  useEffect(() => {
    !isView && callback(receivedItems);
  }, [receivedItems]);

  useEffect(() => {
    isView && setReceivedItems(receivedItemsList || []);
  }, [receivedItemsList]);
  return (
    <React.Fragment>
      <Table.ScrollArea id={id}>
        <Table.Root variant="outline" size="sm" striped interactive>
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeader>Received For</Table.ColumnHeader>
              <Table.ColumnHeader textAlign="end">Amount</Table.ColumnHeader>
              <Table.ColumnHeader textAlign="center">Action</Table.ColumnHeader>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {receivedItems.length === 0 && (
              <Table.Row>
                <Table.Cell textAlign="center" py={6} colSpan={3}>
                  <Text color="fg.muted" fontSize="sm">
                    No money received yet
                  </Text>
                </Table.Cell>
              </Table.Row>
            )}
            {receivedItems && receivedItems?.length !== 0 && (
              <React.Fragment>
                {receivedItems?.map(
                  (received: ReceivedItemsInput, i: number) => {
                    return (
                      <Table.Row key={i}>
                        <Table.Cell>{received.receivedFor}</Table.Cell>
                        <Table.Cell textAlign="end" fontWeight="semibold" color="green.600">
                          {received.amount}
                        </Table.Cell>
                        <Table.Cell textAlign="center">
                          {!isView ? (
                            <Button
                              size="xs"
                              minW="16"
                              variant="ghost"
                              colorPalette="red"
                              onClick={() => {
                                const tempReceivedItems = [...receivedItems];
                                tempReceivedItems.splice(i, 1);
                                setReceivedItems(tempReceivedItems);
                              }}
                            >
                              Remove
                            </Button>
                          ) : (
                            <Text color="fg.muted">—</Text>
                          )}
                        </Table.Cell>
                      </Table.Row>
                    );
                  },
                )}
              </React.Fragment>
            )}
          </Table.Body>
        </Table.Root>
      </Table.ScrollArea>
      {!isView && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setIsSubmitted(true);
            if (!newReceivedItem?.amount || !newReceivedItem?.receivedFor) {
              return;
            }
            setReceivedItems((currentState) => [
              ...currentState,
              newReceivedItem,
            ]);
            setIsSubmitted(false);
            setNewReceivedItem(undefined);
            formFocus?.current?.focus();
          }}
        >
          <SimpleGrid className="hide-in-print" columns={{ base: 2, md: 12 }} gap={3} p={2} alignItems="end">
            <GridItem colSpan={{ base: 2, md: 6 }}>
              <Input
                tabIndex={4}
                inputName="Received For"
                inputLabel="Received For"
                inputType="text"
                max={20}
                placeholderValue="Received Amount For?"
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                  const receivedFor = e.target.value;
                  setNewReceivedItem((currentState) => ({
                    ...currentState,
                    receivedFor,
                  }));
                }}
                isInvalid={submitted && !newReceivedItem?.receivedFor}
                value={newReceivedItem?.receivedFor || ''}
                innerRef={formFocus}
              />
            </GridItem>
            <GridItem colSpan={{ base: 1, md: 3 }}>
              <Input
                tabIndex={5}
                inputName="Amount"
                inputLabel="Amount"
                inputType="number"
                max={20}
                placeholderValue="Amount"
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                  const amount = Number(e.target.value);
                  setNewReceivedItem((currentState) => ({
                    ...currentState,
                    amount,
                  }));
                }}
                isInvalid={submitted && !newReceivedItem?.amount}
                value={newReceivedItem?.amount || ''}
              />
            </GridItem>
            <GridItem colSpan={{ base: 1, md: 3 }}>
              <Button id="receivedfor-submit" type="submit" colorPalette="brand" w="full">
                <Icon name="add" light />
                Add
              </Button>
            </GridItem>
          </SimpleGrid>
        </form>
      )}
    </React.Fragment>
  );
};
