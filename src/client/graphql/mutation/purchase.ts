import gql from 'graphql-tag';

export const CREATE_PURCHASE = gql`
  mutation createPurchase(
    $items: [PurchaseItemInput!]!
    $vendor: String
    $contact: String
    $email: String
    $total: Float!
    $discount: Float
  ) {
    createPurchase(
      sale: {
        items: $items
        vendor: $vendor
        contact: $contact
        email: $email
        total: $total
        discount: $discount
      }
    ) {
      _id
    }
  }
`;

export const UPDATE_PURCHASE = gql`
  mutation updatePurchase(
    $_id: ID!
    $items: [PurchaseItemInput!]!
    $vendor: String
    $contact: String
    $email: String
    $total: Float!
    $discount: Float
  ) {
    updatePurchase(
      purchase: {
        _id: $_id
        items: $items
        vendor: $vendor
        contact: $contact
        email: $email
        total: $total
        discount: $discount
      }
    ) {
      _id
    }
  }
`;

