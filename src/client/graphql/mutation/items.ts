import { gql } from '@apollo/client';

export const CREATE_ITEM = gql`
  mutation createItem(
    $name: String!
    $category: String
    $price: PriceInput!
    $stock: Float!
    $imageUrls: [String!]
  ) {
    createItem(
      item: {
        name: $name
        category: $category
        price: $price
        stock: $stock
        imageUrls: $imageUrls
      }
    ) {
      _id
      shortId
      name
      category
      price {
        cost
        list
        sale
      }
      stock
      imageUrls
    }
  }
`;

// Note: BulkUpdateItemInput.price uses BulkUpdatePriceInput (all fields
// optional) so a row can update just one price column without wiping the
// other two - unlike PriceInput used by create/updateItem.
export const BULK_UPDATE_ITEMS_BY_SHORT_ID = gql`
  mutation bulkUpdateItemsByShortId($items: [BulkUpdateItemInput!]!) {
    bulkUpdateItemsByShortId(items: $items) {
      updated {
        _id
        shortId
        name
        category
        price {
          cost
          list
          sale
        }
        stock
        imageUrls
      }
      notFound
      errors {
        shortId
        message
      }
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
    $imageUrls: [String!]
  ) {
    updateItem(
      item: {
        _id: $_id
        name: $name
        category: $category
        price: $price
        stock: $stock
        imageUrls: $imageUrls
      }
    ) {
      _id
      shortId
      name
      category
      price {
        cost
        list
        sale
      }
      stock
      imageUrls
    }
  }
`;
