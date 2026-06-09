import { ApolloClient, InMemoryCache, HttpLink, from } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_BASE, GRAPHQL_URL } from './config';

let isRefreshing = false;
let refreshPromise = null;

async function refreshAccessToken() {
  if (isRefreshing && refreshPromise) return refreshPromise;

  isRefreshing = true;
  refreshPromise = (async () => {
    const refreshToken = await AsyncStorage.getItem('refreshToken');
    if (!refreshToken) throw new Error('No refresh token available');

    const response = await axios.post(`${API_BASE}/auth/refresh`, { refreshToken });
    const { accessToken, refreshToken: newRefreshToken } = response.data;

    await AsyncStorage.setItem('accessToken', accessToken);
    await AsyncStorage.setItem('refreshToken', newRefreshToken);
    return accessToken;
  })();

  try {
    return await refreshPromise;
  } finally {
    isRefreshing = false;
    refreshPromise = null;
  }
}

const httpLink = new HttpLink({ uri: GRAPHQL_URL });

const authLink = setContext(async (_, { headers }) => {
  const token = await AsyncStorage.getItem('accessToken');
  return {
    headers: {
      ...headers,
      ...(token ? { 'x-auth-token': token } : {})
    }
  };
});

const errorLink = onError(({ graphQLErrors, operation, forward }) => {
  const isAuthError = graphQLErrors?.some(
    (e) => e.extensions?.code === 'UNAUTHENTICATED'
  );

  if (!isAuthError) return;

  return new Promise((resolve, reject) => {
    refreshAccessToken()
      .then(() => resolve(forward(operation)))
      .catch(async (err) => {
        await AsyncStorage.multiRemove(['accessToken', 'refreshToken', 'user']);
        reject(err);
      });
  });
});

export const apolloClient = new ApolloClient({
  link: from([errorLink, authLink, httpLink]),
  cache: new InMemoryCache(),
  defaultOptions: {
    query: { fetchPolicy: 'network-only' },
    mutate: { fetchPolicy: 'no-cache' }
  }
});

export function toAxiosError(err) {
  const message = err?.graphQLErrors?.[0]?.message || err?.message || 'Request failed';
  return { response: { data: { msg: message } } };
}

export async function gqlRequest(query, variables) {
  try {
    const result = await apolloClient.query({ query, variables });
    return result.data;
  } catch (err) {
    throw toAxiosError(err);
  }
}

export async function gqlMutate(mutation, variables) {
  try {
    const result = await apolloClient.mutate({ mutation, variables });
    return result.data;
  } catch (err) {
    throw toAxiosError(err);
  }
}
