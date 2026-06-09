const mongoose = require('mongoose');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const config = require('./config');
const logger = require('./utils/logger');
const app = require('./app');
const { registerErrorHandlers } = app;
const { cleanupExpiredTokens } = require('./utils/session');
const { setupGraphQL } = require('./graphql');

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: config.CORS_ORIGIN } });

mongoose.connect(config.MONGODB_URI)
  .then(() => logger.info('✅ MongoDB connected'))
  .catch((err) => {
    logger.error('❌ MongoDB error:', err);
    process.exit(1);
  });

app.set('io', io);

io.on('connection', (socket) => {
  logger.info('A client connected');
  socket.on('disconnect', () => logger.info('Client disconnected'));
});

async function start() {
  await setupGraphQL(app, server);
  registerErrorHandlers(app);

  const PORT = config.PORT;
  server.listen(PORT, () => {
    logger.info(`🚀 Server on port ${PORT}`);
    logger.info(`📚 Swagger UI: http://localhost:${PORT}/api/docs`);
    logger.info(`🔷 GraphQL: http://localhost:${PORT}/graphql`);
  });
}

start().catch((err) => {
  logger.error('Failed to start server:', err);
  process.exit(1);
});

setInterval(async () => {
  try {
    const deleted = await cleanupExpiredTokens();
    if (deleted > 0) logger.info(`Cleaned up ${deleted} expired refresh tokens`);
  } catch (error) {
    logger.error('Error cleaning up expired tokens:', error);
  }
}, 60 * 60 * 1000);
