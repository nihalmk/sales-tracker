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
  query getItemsForUser($search: String, $page: Float, $limit: Float) {
    getItemsForUser(search: $search, page: $page, limit: $limit) {
      items ${itemsResponse}
      totalCount
      totalStockAmount
    }
  }
`;
