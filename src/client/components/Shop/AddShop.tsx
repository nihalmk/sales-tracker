import { useState, ChangeEvent, useContext, useEffect } from 'react';
import { NextPage } from 'next';
import { useMutation, useQuery } from '@apollo/client';
import { CREATE_SHOP } from '../../graphql/mutation/shop';
import { LabelValueObj } from '../common/SelectBoxes/SelectBox';
import Input from '../common/Inputs/FormInput';
import SuccessMessage from '../Alerts/SuccessMessage';
import ErrorMessage from '../Errors/ErrorMessage';
import _ from 'lodash';
import Link from 'next/link';
import { Pages } from '../../utils/pages';
import { useRouter } from 'next/router';
import { Shop } from '../../generated/graphql';
import UserContext from '../UserWrapper/UserContext';
import { GET_SHOP_TYPE } from '../../graphql/query/shop';
import CreatableSelect from '../common/SelectBoxes/CreatableSelect';
import {
  Card,
  Heading,
  SimpleGrid,
  Stack,
  Button,
  HStack,
} from '@chakra-ui/react';
import Icon from '../common/Icon';

interface Props {}

const AddShop: NextPage<Props> = function () {
  const { refetchUser } = useContext(UserContext);

  const [submitShopForm, { loading: loadingCreate }] = useMutation(CREATE_SHOP);
  const { data: shopTypesData } = useQuery(GET_SHOP_TYPE);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [shopTypes, setShopTypes] = useState<LabelValueObj[]>([]);
  const [shopState, setShopState] = useState<Shop>();

  const router = useRouter();

  useEffect(() => {
    if (shopTypesData?.getShopTypes) {
      setShopTypes(shopTypesData.getShopTypes);
    }
  }, [shopTypesData]);

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
    <Card.Root variant="elevated" borderRadius="l3">
      <Card.Header>
        <HStack gap={2}>
          <Icon name="shop" boxSize={5} />
          <Heading size="md">New Shop</Heading>
        </HStack>
      </Card.Header>
      <form onSubmit={onSubmit}>
        <Card.Body>
          <SimpleGrid columns={{ base: 1, md: 2 }} gap={6}>
            <Stack gap={4}>
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
            </Stack>
            <Stack gap={4}>
              <CreatableSelect
                tabIndex={2}
                selectLabel="Type"
                options={shopTypes}
                onChange={(e: LabelValueObj) => {
                  const type = e.value;
                  setShopState((currentState) => ({
                    ...currentState,
                    type: type,
                  }));
                  setShopTypes((c) => {
                    const types = _.uniqBy([...c, e], 'label');
                    return types;
                  });
                }}
                value={shopTypes.find((c) => {
                  return c.value === shopState?.type;
                })}
                isInvalid={!!(submitted && !shopState?.type)}
              ></CreatableSelect>
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
            </Stack>
          </SimpleGrid>
          <button type="submit" hidden></button>
        </Card.Body>
      </form>
      <Card.Footer flexDir="column" alignItems="stretch" gap={3}>
        <SuccessMessage message={message} />
        <ErrorMessage error={error} />
        <HStack w="full">
          <Button asChild variant="outline" colorPalette="red">
            <Link href="/shop">
              <Icon name="cancel" />
              Cancel
            </Link>
          </Button>
          <Button
            colorPalette="brand"
            ml="auto"
            loading={loadingCreate}
            onClick={onSubmit}
          >
            <Icon name="done" light />
            Submit
          </Button>
        </HStack>
      </Card.Footer>
    </Card.Root>
  );
};

export default AddShop;
