import React, { useState, ChangeEvent, useEffect, useRef } from 'react';
import { NextPage } from 'next';
import _ from 'lodash';
import { ReceivedItemsInput } from '../../generated/graphql';
import Input from '../common/Inputs/FormInput';

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
      <div className="table-responsive" id={id}>
        <table className="table card-table table-hover table-outline">
          <thead>
            <tr>
              <th>Received For</th>
              <th className="w-25">Amount</th>
              <th className="w-10">Action</th>
            </tr>
          </thead>
          <tbody>
            {receivedItems.length === 0 && (
              <tr>
                <td className={'text-center'} colSpan={6}>
                  {'No additional money received!'}
                </td>
              </tr>
            )}
            {receivedItems && receivedItems?.length !== 0 && (
              <React.Fragment>
                {receivedItems?.map(
                  (received: ReceivedItemsInput, i: number) => {
                    return (
                      <tr key={i}>
                        <td>{received.receivedFor}</td>
                        <td>{received.amount}</td>
                        <td>
                          {!isView ? (
                            <button
                              type="button"
                              className="btn btn-icon btn-secondary btn-sm"
                              onClick={() => {
                                const tempReceivedItems = [...receivedItems];
                                tempReceivedItems.splice(i, 1);
                                setReceivedItems(tempReceivedItems);
                              }}
                            >
                              <strong className="bigger">X</strong>
                            </button>
                          ) : (
                            '-'
                          )}
                        </td>
                      </tr>
                    );
                  },
                )}
              </React.Fragment>
            )}
          </tbody>
        </table>
      </div>
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
          <div className="row pl-2 pr-2 hide-in-print">
            <div className="col-md-6">
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
            </div>
            <div className="col-md-3">
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
            </div>
            <div className="col-md-3">
              <label className="form-label">Add</label>
              <button
                id="receivedfor-submit"
                type="submit"
                className={'btn btn-primary ml-auto'}
              >
                + Add
              </button>
            </div>
          </div>
        </form>
      )}
      <style jsx>{`
        .w-10 {
          width: 10%;
        }
        .w-25 {
          width: 25%;
        }
      `}</style>
    </React.Fragment>
  );
};
