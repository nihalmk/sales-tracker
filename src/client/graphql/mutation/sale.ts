import gql from 'graphql-tag';

export const CREATE_SALE = gql`
  mutation createSale(
    $items: [SaleItemInput!]!
    $customer: String!
    $contact: String
    $email: String
    $total: Float!
    $discount: Float
    $profit: Float!
    $loss: Float!
  ) {
    createSale(
      sale: {
        items: $items
        customer: $customer
        contact: $contact
        email: $email
        total: $total
        discount: $discount
        profit: $profit
        loss: $loss
      }
    ) {
      _id
    }
  }
`;

export const UPDATE_SALE = gql`
  mutation updateSale(
    $_id: ID!
    $items: [SaleItemInput!]!
    $customer: String!
    $contact: String
    $email: String
    $total: Float!
    $discount: Float
    $profit: Float!
    $loss: Float!
  ) {
    updateSale(
      sale: {
        _id: $_id
        items: $items
        customer: $customer
        contact: $contact
        email: $email
        total: $total
        discount: $discount
        profit: $profit
        loss: $loss
      }
    ) {
      _id
    }
  }
`;

