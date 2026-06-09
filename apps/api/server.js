const path = require('path');
const dotenv = require('dotenv');

const localEnv = path.join(__dirname, '.env');
const rootEnv = path.join(__dirname, '..', '..', '.env');

dotenv.config({ path: localEnv });
dotenv.config({ path: rootEnv });

require('./src/server');
