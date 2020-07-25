import gql from 'graphql-tag';

export const CREATE_SHOP = gql`
  mutation createShop($name: String!, $type: String!, $address: AddressInput!) {
    createShop(shop: { name: $name, type: $type, address: $address }) {
      _id
    }
  }
`;
