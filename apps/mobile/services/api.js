/*
 * API service — uses GraphQL under the hood (same function signatures as REST).
 * Swagger REST docs: {API_HOST}/api/docs
 * GraphQL playground: {API_HOST}/graphql
 */
export * from './graphqlApi';
export { API_BASE, API_HOST, GRAPHQL_URL } from './config';
export { apolloClient } from './graphqlClient';
