const { ApolloServer } = require('@apollo/server');
const { expressMiddleware } = require('@apollo/server/express4');
const { ApolloServerPluginDrainHttpServer } = require('@apollo/server/plugin/drainHttpServer');
const typeDefs = require('./typeDefs');
const resolvers = require('./resolvers');
const { createContext } = require('./auth');

async function setupGraphQL(app, httpServer) {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    introspection: true,
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
    formatError: (formattedError) => ({
      message: formattedError.message,
      extensions: formattedError.extensions
    })
  });

  await server.start();

  app.use(
    '/graphql',
    expressMiddleware(server, {
      context: createContext
    })
  );

  return server;
}

module.exports = { setupGraphQL };
