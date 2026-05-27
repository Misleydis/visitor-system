const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const config = require('./config');
const logger = require('./utils/logger');
const { authRoutes, visitorRoutes, userRoutes, occurrenceBookRoutes } = require('./routes');
const { auth, errorHandler, notFound, authLimiter, apiLimiter, passwordResetLimiter } = require('./middleware');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: config.CORS_ORIGIN } });

// Middleware
app.use(cors({ origin: config.CORS_ORIGIN }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`, { ip: req.ip });
  next();
});

// Database connection
mongoose.connect(config.MONGODB_URI)
  .then(() => logger.info('✅ MongoDB connected'))
  .catch(err => {
    logger.error('❌ MongoDB error:', err);
    process.exit(1);
  });

// Make io accessible in routes
app.set('io', io);

// Rate limiting (removed from login to allow unlimited attempts)
app.use('/api/auth/forgot-password', passwordResetLimiter);
app.use('/api/auth/reset-password', passwordResetLimiter);
app.use('/api/', apiLimiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/visitors', auth, visitorRoutes);
app.use('/api/users', auth, userRoutes);
app.use('/api/occurrence-book', auth, occurrenceBookRoutes);

// 404 handler
app.use(notFound);

// Error handler
app.use(errorHandler);

// Socket.IO
io.on('connection', (socket) => {
  logger.info('A client connected');
  socket.on('disconnect', () => logger.info('Client disconnected'));
});

// Start server
const PORT = config.PORT;
server.listen(PORT, () => logger.info(`🚀 Server on port ${PORT}`));

// Cleanup expired refresh tokens periodically (every hour)
setInterval(async () => {
  const { cleanupExpiredTokens } = require('./utils/session');
  try {
    const deleted = await cleanupExpiredTokens();
    if (deleted > 0) {
      logger.info(`Cleaned up ${deleted} expired refresh tokens`);
    }
  } catch (error) {
    logger.error('Error cleaning up expired tokens:', error);
  }
}, 60 * 60 * 1000); // Every hour