export const ClientResolvers = {
  Mutation: {
    updateNetworkStatus: (
      _: { _: any },
      {
        isConnected,
        reconnected,
        isPaid,
      }: { isConnected: boolean; reconnected: boolean; isPaid: boolean },
      { cache }: { cache: any },
    ): null => {
      const data = {
        networkStatus: {
          __typename: 'NetworkStatus',
          isConnected,
          reconnected,
          isPaid,
        },
      };
      cache.writeData({ data });
      return null;
    },
  },
};

export const ClientStateDefaults = {
  networkStatus: {
    __typename: 'NetworkStatus',
    isConnected: true,
    reconnected: false,
  },
};
