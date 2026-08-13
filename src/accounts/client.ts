import { AccountsClient } from '@accounts/client';
import { AccountsClientPassword } from '@accounts/client-password';
import GraphQLClient from '@accounts/graphql-client';
import { accountsLink } from '@accounts/apollo-link';
import { ApolloClient, HttpLink, InMemoryCache, from } from '@apollo/client';
import 'cross-fetch/polyfill';

// This auth link will inject the token in the headers on every request you make using apollo client
const authLink = accountsLink(() => accountsClient);

// Same reasoning as src/client/apollo/client.tsx: a relative URI resolves
// against the current origin in the browser, avoiding a hardcoded host.
// This module is browser-only (accounts login/register/session), so there's
// no SSR case to account for here.
const httpLink = new HttpLink({
  uri: process.env.GRAPHQL_SERVER || '/graphql',
});

const apolloClient = new ApolloClient({
  link: from([authLink, httpLink]),
  cache: new InMemoryCache(),
});

const accountsGraphQL = new GraphQLClient({ graphQLClient: apolloClient });
const accountsClient = new AccountsClient({}, accountsGraphQL);
const accountsPassword = new AccountsClientPassword(accountsClient);

export { accountsClient, accountsGraphQL, accountsPassword, apolloClient };
