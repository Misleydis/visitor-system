require('dotenv').config();

/**
 * Configuration management
 * Validates and provides access to environment variables
 */
const config = {
  // Server
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  
  // Database
  MONGODB_URI: process.env.MONGODB_URI,
  
  // JWT
  JWT_SECRET: process.env.JWT_SECRET,
  ACCESS_TOKEN_EXPIRY: '15m',
  REFRESH_TOKEN_EXPIRY_DAYS: 30,
  
  // Email
  EMAIL_USER: process.env.EMAIL_USER,
  EMAIL_PASS: process.env.EMAIL_PASS,
  
  // Twilio (for SMS)
  TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID,
  TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN,
  TWILIO_PHONE_NUMBER: process.env.TWILIO_PHONE_NUMBER,
  
  // CORS
  CORS_ORIGIN: process.env.CORS_ORIGIN || '*',
};

/**
 * Validate required environment variables
 */
const validateConfig = () => {
  const required = ['MONGODB_URI', 'JWT_SECRET'];
  const missing = required.filter(key => !config[key]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
  
  return true;
};

// Validate on import
try {
  validateConfig();
} catch (error) {
  console.error('Configuration Error:', error.message);
  process.exit(1);
}

module.exports = config;
