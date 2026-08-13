import { makeVar } from '@apollo/client';

export interface NetworkStatusValue {
  isConnected: boolean;
  reconnected: boolean;
  isPaid?: boolean;
}

export const networkStatusVar = makeVar<NetworkStatusValue>({
  isConnected: true,
  reconnected: false,
});
