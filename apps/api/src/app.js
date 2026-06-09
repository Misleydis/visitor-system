const express = require('express');
const cors = require('cors');
const config = require('./config');
const logger = require('./utils/logger');
const { setupSwagger } = require('./docs/swagger');
const { authRoutes, visitorRoutes, userRoutes, occurrenceBookRoutes } = require('./routes');
const { auth, errorHandler, notFound, apiLimiter, passwordResetLimiter } = require('./middleware');

const app = express();

app.use(cors({ origin: config.CORS_ORIGIN }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`, { ip: req.ip });
  next();
});

setupSwagger(app);

app.use('/api/auth/forgot-password', passwordResetLimiter);
app.use('/api/auth/reset-password', passwordResetLimiter);
app.use('/api/', apiLimiter);

app.use('/api/auth', authRoutes);
app.use('/api/visitors', auth, visitorRoutes);
app.use('/api/users', auth, userRoutes);
app.use('/api/occurrence-book', auth, occurrenceBookRoutes);

module.exports = app;
module.exports.registerErrorHandlers = (appInstance) => {
  appInstance.use(notFound);
  appInstance.use(errorHandler);
};
