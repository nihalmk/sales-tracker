import { gql } from '@apollo/client';

export const GET_SHOP_TYPE = gql`
  query getShopTypes {
    getShopTypes {
      label
      value
    }
  }
`;
