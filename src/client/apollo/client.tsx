import React from 'react';
import { ApolloProvider } from '@apollo/client';
import { ApolloClient } from '@apollo/client';
import { InMemoryCache, NormalizedCacheObject } from '@apollo/client';
import { AppInitialProps } from 'next/app';
import { NextPageContext } from 'next';
import { onError } from '@apollo/client/link/error';
import { HttpLink } from '@apollo/client';
import { ApolloLink, split } from '@apollo/client';
import fetch from 'isomorphic-unfetch';
import cookie from 'js-cookie';
import { setContext } from '@apollo/client/link/context';
import { WebSocketLink } from '@apollo/client/link/ws';
import { getMainDefinition } from '@apollo/client/utilities';
import { SubscriptionClient } from 'subscriptions-transport-ws';
import { networkStatusVar } from './networkStatus';

let globalApolloClient: ApolloClient<NormalizedCacheObject> = null;

interface ApolloAppIProps extends AppInitialProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  apolloClient: any;
  apolloState: any;
}

export interface CTX extends NextPageContext {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  apolloClient: any;
}

/**
 * Creates and provides the apolloContext
 * to a next.js PageTree. Use it by wrapping
 * your PageComponent via HOC pattern.
 * @param {Function|Class} PageComponent
 * @param {Object} [config]
 * @param {Boolean} [config.ssr=true]
 */
export function withApollo(
  PageComponent: any,
  { ssr = true }: { ssr?: boolean } = {},
): React.FC<any> {
  const WithApollo = ({
    apolloClient,
    apolloState,
    ...pageProps
  }: ApolloAppIProps) => {
    const client = apolloClient || initApolloClient(apolloState);
    return (
      <ApolloProvider client={client}>
        <PageComponent {...pageProps} />
      </ApolloProvider>
    );
  };
  // Set the correct displayName in development
  if (process.env.NODE_ENV !== 'production') {
    const displayName =
      PageComponent.displayName || PageComponent.name || 'Component';

    if (displayName === 'App') {
      console.warn('This withApollo HOC only works with PageComponents.');
    }

    WithApollo.displayName = `withApollo(${displayName})`;
  }

  if (ssr || PageComponent.getInitialProps) {
    WithApollo.getInitialProps = async (ctx: CTX) => {
      const { AppTree } = ctx;

      // Initialize ApolloClient, add it to the ctx object so
      // we can use it in `PageComponent.getInitialProp`.
      const apolloClient = (ctx.apolloClient = initApolloClient({}));

      // Run wrapped getInitialProps methods
      let pageProps = {};
      if (PageComponent.getInitialProps) {
        pageProps = await PageComponent.getInitialProps(ctx);
      }

      // Only on the server:
      if (typeof window === 'undefined') {
        // When redirecting, the response is finished.
        // No point in continuing to render
        // if (ctx.res && ctx.res.finished) {
        //   return pageProps;
        // }

        // Only if ssr is enabled
        if (ssr) {
          try {
            // Run all GraphQL queries
            const { getDataFromTree } =
              await import('@apollo/client/react/ssr');
            await getDataFromTree(
              <AppTree
                pageProps={{
                  ...pageProps,
                  apolloClient,
                }}
              />,
            );
          } catch (error) {
            // Prevent Apollo Client GraphQL errors from crashing SSR.
            // Handle them in components via the data.error prop:
            // https://www.apollographql.com/docs/react/api/react-apollo.html#graphql-query-data-error
            console.error('Error while running `getDataFromTree`', error);
          }
        }
      }

      // Extract query data from the Apollo store
      const apolloState = apolloClient.cache.extract();

      return {
        ...pageProps,
        apolloState,
      };
    };
  }

  return WithApollo;
}

/**
 * Always creates a new apollo client on the server
 * Creates or reuses apollo client in the browser.
 * @param  {Object} initialState
 */
function initApolloClient(initialState: NormalizedCacheObject) {
  // Make sure to create a new client for every server-side request so that data
  // isn't shared between connections (which would be bad)
  if (typeof window === 'undefined') {
    return createApolloClient(initialState);
  }

  // Reuse client on the client-side
  if (!globalApolloClient) {
    globalApolloClient = createApolloClient(initialState);
  }

  return globalApolloClient;
}

/**
 * Creates and configures the ApolloClient
 * @param  {Object} [initialState={}]
 */
function createApolloClient(
  initialState: NormalizedCacheObject = {},
): ApolloClient<NormalizedCacheObject> {
  const isBrowser = typeof window !== 'undefined';
  const ssrMode = !isBrowser;
  const cache = new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          networkStatus: {
            read() {
              return {
                __typename: 'NetworkStatus',
                ...networkStatusVar(),
              };
            },
          },
        },
      },
    },
  }).restore(initialState);

  const authLink = setContext((_, { headers }) => {
    // get the authentication token from local storage if it exists
    const token = cookie.get('token');
    // return the headers to the context so httpLink can read them
    return {
      headers: {
        ...headers,
        authorization: token ? `Bearer ${token}` : '',
      },
    };
  });

  // TODO: use process.env.GRAPHQL_WEBSOCKET_SERVER
  let webSocketUri = process.env.GRAPHQL_SERVER
    ? process.env.GRAPHQL_SERVER
    : `ws://localhost:3000/graphql`;
  if (webSocketUri.indexOf('https://') > -1) {
    webSocketUri = process.env.GRAPHQL_SERVER.replace(/https/, 'wss');
  } else if (webSocketUri.indexOf('http://') > -1) {
    webSocketUri = process.env.GRAPHQL_SERVER.replace(/http/, 'ws');
  }
  const subscriptionClient = isBrowser
    ? new SubscriptionClient(webSocketUri, {
        reconnect: true,
        lazy: true,
        connectionParams: () => ({
          token: cookie.get('token'),
        }),
      })
    : null;
  const wsLink = isBrowser ? new WebSocketLink(subscriptionClient) : null;

  const httpLink = new HttpLink({
    uri: process.env.GRAPHQL_SERVER || 'http://localhost:3000/graphql',
    credentials: 'include',
    fetch,
  });

  // using the ability to split links, you can send data to each link
  // depending on what kind of operation is being sent
  const link = isBrowser
    ? split(
        // split based on operation type
        ({ query }) => {
          const definition = getMainDefinition(query);
          return (
            definition.kind === 'OperationDefinition' &&
            definition.operation === 'subscription'
          );
        },
        wsLink,
        httpLink,
      )
    : httpLink;

  const client = new ApolloClient({
    link: ApolloLink.from([
      onError(({ graphQLErrors, networkError }) => {
        if (graphQLErrors) {
          // console.log(graphQLErrors);
          //sendToLoggingService(graphQLErrors);
        }
        if (networkError) {
          // TODO: logout user / do necessary
          //logoutUser();
        }
      }),
      authLink,
      link,
    ]),
    ssrMode,
    cache,
  });

  const setNetworkStatus = (
    status: boolean,
    reconnected: boolean,
    isPaid?: boolean,
  ) => {
    networkStatusVar({
      isConnected: status,
      reconnected,
      isPaid,
    });
  };

  subscriptionClient &&
    subscriptionClient.onConnected(() => {
      setNetworkStatus(true, false);
    });

  subscriptionClient &&
    subscriptionClient.onDisconnected(() => {
      setNetworkStatus(false, false);
    });

  subscriptionClient &&
    subscriptionClient.onReconnected(() => {
      setNetworkStatus(true, true);
    });

  return client;
}
