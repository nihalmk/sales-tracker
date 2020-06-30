import gql from 'graphql-tag';

export const GET_NETWORK_STATUS = gql`
  query {
    networkStatus @client {
      isConnected
      reconnected
    }
  }
`;

export const UPDATE_NETWORK_STATUS = gql`
  mutation updateNetworkStatus($isConnected: Boolean, $reconnected: Boolean) {
    updateNetworkStatus(isConnected: $isConnected, reconnected: $reconnected)
      @client
  }
`;

export interface NetworkStatus {
  networkStatus: {
    isConnected: boolean;
    reconnected: boolean;
  };
}
