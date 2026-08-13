import { gql } from '@apollo/client';

export const GET_NETWORK_STATUS = gql`
  query {
    networkStatus @client {
      isConnected
      reconnected
      isPaid
    }
  }
`;

export interface NetworkStatus {
  networkStatus: {
    isConnected: boolean;
    reconnected: boolean;
    isPaid: boolean;
  };
}
