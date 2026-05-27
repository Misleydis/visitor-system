const mongoose = require('mongoose');
require('dotenv').config();

async function dropIndex() {
  await mongoose.connect(process.env.MONGODB_URI);
  const collection = mongoose.connection.collection('visitors');
  await collection.dropIndex('ticketNumber_1');
  console.log('Old index dropped');
  process.exit(0);
}
dropIndex();