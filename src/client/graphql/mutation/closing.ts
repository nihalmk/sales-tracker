import gql from 'graphql-tag';

export const CREATE_CLOSING = gql`
  mutation createClosing(
    $salesIds: [ID!]
    $spentItems: [SpentItemsInput!]
    $receivedItems: [ReceivedItemsInput!]
    $inHandTotal: Float
    $spentTotal: Float
    $active: Boolean!
    $date: DateTime!
  ) {
    createClosing(
      closing: {
        salesIds: $salesIds
        spentItems: $spentItems
        receivedItems: $receivedItems
        inHandTotal: $inHandTotal
        spentTotal: $spentTotal
        active: $active
        date: $date
      }
    ) {
      _id
    }
  }
`;
