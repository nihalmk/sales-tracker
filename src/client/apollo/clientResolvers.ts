export const ClientResolvers = {
  Mutation: {
    updateNetworkStatus: (
      _: { _: any },
      {
        isConnected,
        reconnected,
      }: { isConnected: boolean; reconnected: boolean },
      { cache }: { cache: any },
    ): null => {
      const data = {
        networkStatus: {
          __typename: 'NetworkStatus',
          isConnected,
          reconnected,
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
