import gql from 'graphql-tag';

export const GET_SHOP_TYPE = gql`
  query getShopTypes {
    getShopTypes {
      label
      value
    }
  }
`;
