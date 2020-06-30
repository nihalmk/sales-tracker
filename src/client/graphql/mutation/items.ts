import gql from 'graphql-tag';

export const CREATE_ITEM = gql`
  mutation createItem(
    $name: String!
    $category: String
    $price: PriceInput!
    $stock: Float!
  ) {
    createItem(
      item: { name: $name, category: $category, price: $price, stock: $stock }
    ) {
      _id
    }
  }
`;

export const UPDATE_ITEM = gql`
  mutation updateItem(
    $_id: ID!
    $name: String!
    $category: String
    $price: PriceInput!
    $stock: Float!
  ) {
    updateItem(
      item: { _id: $_id, name: $name, category: $category, price: $price, stock: $stock }
    ) {
      _id
    }
  }
`;
