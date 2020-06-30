import { useState, ChangeEvent, useContext } from 'react';
import { NextPage } from 'next';
import { useMutation } from '@apollo/react-hooks';
import { CREATE_SHOP } from '../../graphql/mutation/shop';
import SelectBox, { LabelValueObj } from '../common/SelectBoxes/SelectBox';
import Input from '../common/Inputs/FormInput';
import SuccessMessage from '../Alerts/SuccessMessage';
import ErrorMessage from '../Errors/ErrorMessage';
import _ from 'lodash';
import Link from 'next/link';
import { Pages } from '../../utils/pages';
import { useRouter } from 'next/router';
import { ShopType, Shop } from '../../generated/graphql';
import { getLabelValueFromEnum } from '../../utils/helpers';
import UserContext from '../UserWrapper/UserContext';

interface Props {}

const shopTypes = getLabelValueFromEnum(ShopType);

const AddShop: NextPage<Props> = function () {
  const { refetchUser } = useContext(UserContext);

  const [submitShopForm, { loading: loadingCreate }] = useMutation(CREATE_SHOP);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const [shopState, setShopState] = useState<Shop>();

  const router = useRouter();

  const onSubmit = async (e: React.SyntheticEvent) => {
    e && e.preventDefault();
    const { name, address, type } = shopState;
    setSubmitted(true);
    if (!name || !address?.street || !address?.pincode || !type) {
      setError('Please enter values for all fields');
      setTimeout(() => {
        setError('');
      }, 5000);
      return;
    }
    try {
      const shop = await submitShopForm({
        variables: {
          name,
          address,
          type,
        },
      });
      await refetchUser();
      setMessage('New shop added successfully');
      setTimeout(() => {
        setMessage('');
      }, 5000);
      router.push(`${Pages.DASHBOARD}?created=${shop.data?.createShop?._id}`);
    } catch (e) {
      setError(`Error adding new shop. ${e.message}`);
      setTimeout(() => {
        setError('');
      }, 5000);
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <div className="card-title">{'New Shop'}</div>
        <div className="card-options">
          {/* {isUserAdmin(user) && (
            <Link href={Pages.SHOPS}>
              <button
                className="button-head btn btn-secondary"
                color="secondary"
              >
                <span className="icon">
                  <FontAwesomeIcon icon={faEye}></FontAwesomeIcon>
                </span>{' '}
                Shops
              </button>
            </Link>
          )} */}
        </div>
      </div>
      <form onSubmit={onSubmit}>
        <div className="card-body">
          <div className="row">
            <div className="col-md-6">
              <Input
                tabIndex={1}
                inputName="name"
                inputLabel="Name"
                inputType="text"
                max={20}
                placeholderValue="Name"
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                  const name = e.target.value;
                  setShopState((currentState) => ({
                    ...currentState,
                    name: name,
                  }));
                }}
                isInvalid={!!(submitted && !shopState?.name)}
                value={shopState?.name || ''}
              />
              <Input
                tabIndex={3}
                inputName="address"
                inputLabel="Street Address"
                inputType="text"
                max={50}
                placeholderValue="Address"
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                  const street = e.target.value;
                  setShopState((currentState) => ({
                    ...currentState,
                    address: {
                      ...currentState?.address,
                      street: street,
                    },
                  }));
                }}
                isInvalid={!!(submitted && !shopState?.address?.street)}
                value={shopState?.address?.street || ''}
              />
            </div>
            <div className="col-md-6">
              <SelectBox
                tabIndex={2}
                selectLabel="Type"
                selectData={shopTypes}
                onSelectChange={(e: LabelValueObj) => {
                  const type = e.value;
                  setShopState((currentState) => ({
                    ...currentState,
                    type: type as ShopType,
                  }));
                }}
                selectDefault={shopTypes.find((c) => {
                  return c.value === shopState?.type;
                })}
                isInvalid={!!(submitted && !shopState?.type)}
              ></SelectBox>
              <Input
                tabIndex={3}
                inputName="Pin Code"
                inputLabel="Pin Code"
                inputType="tel"
                max={10}
                placeholderValue="Pin Code"
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                  const pincode = e.target.value;
                  setShopState((currentState) => ({
                    ...currentState,
                    address: {
                      ...currentState?.address,
                      pincode: pincode,
                    },
                  }));
                }}
                isInvalid={!!(submitted && !shopState?.address?.pincode)}
                value={shopState?.address?.pincode || ''}
              />
            </div>
          </div>
          <button type="submit" hidden></button>
        </div>
      </form>
      <div className="card-footer">
        <SuccessMessage message={message} />
        <ErrorMessage error={error} />
        <div className="d-flex">
          <Link href="/shop">
            <button type="button" className={'btn btn-outline-danger'}>
              Cancel
            </button>
          </Link>
          <button
            id="shop-submit"
            type="submit"
            className={
              'btn btn-primary ml-auto ' + (loadingCreate && 'btn-loading')
            }
            onClick={onSubmit}
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddShop;
