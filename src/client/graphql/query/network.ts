import gql from 'graphql-tag';

export const GET_NETWORK_STATUS = gql`
  query {
    networkStatus @client {
      isConnected
      reconnected
      isPaid
    }
  }
`;

export const UPDATE_NETWORK_STATUS = gql`
  mutation updateNetworkStatus(
    $isConnected: Boolean
    $reconnected: Boolean
    $isPaid: Boolean
  ) {
    updateNetworkStatus(
      isConnected: $isConnected
      reconnected: $reconnected
      isPaid: $isPaid
    ) @client
  }
`;

export interface NetworkStatus {
  networkStatus: {
    isConnected: boolean;
    reconnected: boolean;
    isPaid: boolean;
  };
}
