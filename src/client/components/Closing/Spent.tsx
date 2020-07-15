import React, { useState, ChangeEvent, useEffect } from 'react';
import { NextPage } from 'next';
import _ from 'lodash';
import { SpentItemsInput } from '../../generated/graphql';
import Input from '../common/Inputs/FormInput';

interface Props {
  spentItemsList?: SpentItemsInput[];
  callback?: (spentItems: SpentItemsInput[]) => void;
}

export const Spent: NextPage<Props> = function ({ spentItemsList, callback }) {
  const [spentItems, setSpentItems] = useState(spentItemsList || []);
  const [newSpentItem, setNewSpentItem] = useState<SpentItemsInput>();
  const [submitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    callback(spentItems);
  }, [spentItems])
  return (
    <React.Fragment>
      <div className="table-responsive">
        <table className="table card-table table-hover table-outline">
          <thead>
            <tr>
              <th>Spent On</th>
              <th className="w-25">Amount</th>
              <th className="w-10">Action</th>
            </tr>
          </thead>
          <tbody>
            {spentItems.length === 0 && (
              <tr>
                <td className={'text-center'} colSpan={6}>
                  {'No additional money spent!'}
                </td>
              </tr>
            )}
            {spentItems && spentItems?.length !== 0 && (
              <React.Fragment>
                {spentItems?.map((spent: SpentItemsInput, i: number) => {
                  return (
                    <tr key={i}>
                      <td>{spent.spentOn}</td>
                      <td>{spent.amount}</td>
                      <td>
                        <button
                          type="button"
                          className="btn btn-icon btn-secondary btn-sm"
                          onClick={() => {
                            const tempSpentItems = [...spentItems];
                            tempSpentItems.splice(i, 1);
                            setSpentItems(tempSpentItems);
                          }}
                        >
                          <strong className="bigger">X</strong>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </React.Fragment>
            )}
          </tbody>
        </table>
      </div>
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
        }}
      >
        <div className="row pl-2 pr-2">
          <div className="col-md-6">
            <Input
              tabIndex={2}
              inputName="Spent On"
              inputLabel="Spent On"
              inputType="text"
              max={20}
              placeholderValue="Spend Amount On?"
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                const spentOn = e.target.value;
                setNewSpentItem((currentState) => ({
                  ...currentState,
                  spentOn,
                }));
              }}
              isInvalid={submitted && !newSpentItem?.spentOn}
              value={newSpentItem?.spentOn || ''}
            />
          </div>
          <div className="col-md-3">
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
          </div>
          <div className="col-md-3">
            <label className="form-label">Add</label>
            <button
              id="spenton-submit"
              type="submit"
              className={'btn btn-primary ml-auto'}
            >
              + Add
            </button>
          </div>
        </div>
      </form>
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
