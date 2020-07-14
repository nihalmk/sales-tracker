import gql from 'graphql-tag';

export const CREATE_CLOSING = gql`
  mutation createClosing(
    $salesIds: [ObjectId!]!
    $spentItems: [SpentItemsInput!]!
    $receivedItems: [ReceivedItemsInput!]!
    $inHandTotal: Float!
    $spentTotal: Float!
    $active: Boolean!
  ) {
    createClosing(
      closing: {
        salesIds: $salesIds
        spentItems: $spentItems
        receivedItems: $receivedItems
        inHandTotal: $inHandTotal
        spentTotal: $spentTotal
        active: $active
      }
    ) {
      _id
    }
  }
`;
