import gql from 'graphql-tag';
import { orderResponse } from '../query/orders';

export const ORDERS_SUBSCRIPTION = gql`
  subscription getNewOrderForUser($kitchen: ID!) {
    getNewOrderForUser(kitchen: $kitchen) ${orderResponse}
  }
`;

export const ORDERS_UPDATE_SUBSCRIPTION = gql`
  subscription getOrderChangesForUser($kitchen: ID!) {
    getOrderChangesForUser(kitchen: $kitchen) ${orderResponse}
  }
`;
