import gql from 'graphql-tag';

export const closing = `{
      _id
      spentItems {
        spentOn
        amount
      }
      receivedItems {
        receivedFor
        amount
      }
      inHandTotal
      spentTotal
      active
      date
      createdAt
    }`;

export const GET_CLOSINGS = gql`
  query getClosings($date: DateRange!) {
    getClosings(date: $date) ${closing}
  }
`;

export const GET_PREVIOUS_CLOSING = gql`
  query getPreviousClosing {
    getPreviousClosing ${closing}
  }
`;

export const GET_CLOSING_BY_ID = gql`
  query getClosingByClosingId($closingId: String!) {
    getClosingByClosingId(closingId: $closingId) ${closing}
  }
`;
