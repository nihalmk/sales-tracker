import React, { useState, ChangeEvent, useEffect, useRef } from 'react';
import { NextPage } from 'next';
import { useQuery } from '@apollo/client';
import _ from 'lodash';
import { SpentItemsInput } from '../../generated/graphql';
import Input from '../common/Inputs/FormInput';
import CategorySelect from '../common/SelectBoxes/CategorySelect';
import { GET_SPENT_CATEGORIES } from '../../graphql/query/closing';
import { Table, Button, SimpleGrid, GridItem, Text } from '@chakra-ui/react';
import Icon from '../common/Icon';

interface Props {
  spentItemsList?: SpentItemsInput[];
  callback?: (spentItems: SpentItemsInput[]) => void;
  isView?: boolean;
  id: string;
}

export const Spent: NextPage<Props> = function ({
  spentItemsList,
  callback,
  isView,
  id,
}) {
  const [spentItems, setSpentItems] = useState(spentItemsList || []);
  const [newSpentItem, setNewSpentItem] = useState<SpentItemsInput>();
  const [submitted, setIsSubmitted] = useState(false);
  const formFocus = useRef<any>(null);
  // spentItemsList arrives async (a GraphQL query) — it's often still empty
  // at mount, so the useState initializer above misses it. This does a
  // one-time catch-up sync the first time real data shows up (e.g. resuming
  // an existing draft), without re-syncing on every subsequent change and
  // clobbering items the user has since added locally.
  const hasSyncedInitialData = useRef(false);

  const { data: categoriesData } = useQuery(GET_SPENT_CATEGORIES, {
    fetchPolicy: 'no-cache',
  });
  const categories: string[] = categoriesData?.getSpentCategories || [];

  useEffect(() => {
    !isView && callback(spentItems);
  }, [spentItems]);

  useEffect(() => {
    if (isView) {
      setSpentItems(spentItemsList || []);
      return;
    }
    if (!hasSyncedInitialData.current && spentItemsList?.length) {
      setSpentItems(spentItemsList);
      hasSyncedInitialData.current = true;
    }
  }, [spentItemsList]);

  return (
    <React.Fragment>
      <Table.ScrollArea id={id}>
        <Table.Root variant="outline" size="sm" striped interactive>
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeader>Spent On</Table.ColumnHeader>
              <Table.ColumnHeader textAlign="end">Amount</Table.ColumnHeader>
              <Table.ColumnHeader textAlign="center">Action</Table.ColumnHeader>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {spentItems.length === 0 && (
              <Table.Row>
                <Table.Cell textAlign="center" py={6} colSpan={3}>
                  <Text color="fg.muted" fontSize="sm">
                    No money spent yet
                  </Text>
                </Table.Cell>
              </Table.Row>
            )}
            {spentItems && spentItems?.length !== 0 && (
              <React.Fragment>
                {spentItems?.map((spent: SpentItemsInput, i: number) => {
                  return (
                    <Table.Row key={i}>
                      <Table.Cell>{spent.spentOn}</Table.Cell>
                      <Table.Cell
                        textAlign="end"
                        fontWeight="semibold"
                        color="red.600"
                      >
                        {spent.amount}
                      </Table.Cell>
                      <Table.Cell textAlign="center">
                        {!isView ? (
                          <Button
                            size="xs"
                            minW="16"
                            variant="ghost"
                            colorPalette="red"
                            onClick={() => {
                              const tempSpentItems = [...spentItems];
                              tempSpentItems.splice(i, 1);
                              setSpentItems(tempSpentItems);
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
                })}
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
            if (!newSpentItem?.amount || !newSpentItem?.spentOn) {
              return;
            }
            setSpentItems((currentState) => [...currentState, newSpentItem]);
            setIsSubmitted(false);
            setNewSpentItem(undefined);
            formFocus?.current?.focus();
          }}
        >
          <SimpleGrid
            className="hide-in-print"
            columns={{ base: 2, md: 12 }}
            gap={3}
            p={2}
            alignItems="end"
          >
            <GridItem colSpan={{ base: 2, md: 6 }}>
              <CategorySelect
                tabIndex={2}
                label="Spent On"
                placeholder="Spend Amount On?"
                categories={categories}
                value={newSpentItem?.spentOn}
                onSelect={(spentOn) => {
                  setNewSpentItem((currentState) => ({
                    ...currentState,
                    spentOn: spentOn || '',
                  }));
                }}
                isInvalid={submitted && !newSpentItem?.spentOn}
                innerRef={formFocus}
              />
            </GridItem>
            <GridItem colSpan={{ base: 1, md: 3 }}>
              <Input
                tabIndex={3}
                inputName="Amount"
                inputLabel="Amount"
                inputType="number"
                max={20}
                placeholderValue="Amount"
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                  const amount = Number(e.target.value);
                  setNewSpentItem((currentState) => ({
                    ...currentState,
                    amount,
                  }));
                }}
                isInvalid={submitted && !newSpentItem?.amount}
                value={newSpentItem?.amount || ''}
              />
            </GridItem>
            <GridItem colSpan={{ base: 1, md: 3 }}>
              <Button
                id="spenton-submit"
                type="submit"
                colorPalette="brand"
                w="full"
              >
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
