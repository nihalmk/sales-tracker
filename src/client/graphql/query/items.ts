import { gql } from '@apollo/client';

export const itemsResponse = `{
  _id
  name
  shortId
  category
  price {
    cost
    sale
    list
  }
  stock
  shop {
    _id
    name
  }
}`;

export const GET_ITEMS = gql`
  query getItemsForUser {
    getItemsForUser ${itemsResponse}
  }
`;
