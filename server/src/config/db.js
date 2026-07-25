const mongoose = require('mongoose');
const env = require('./env');

// Register Mongoose connection event listeners
mongoose.connection.on('connected', () => {
  console.log('[DB] Mongoose connection established');
});

mongoose.connection.on('error', (err) => {
  console.error(`[DB ERROR] Mongoose connection error: ${err.message}`);
});

mongoose.connection.on('disconnected', () => {
  console.log('[DB] Mongoose connection disconnected');
});

/**
 * Connect to MongoDB instance using mongoose
 * @returns {Promise<typeof mongoose>}
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(env.MONGO_URI);
    console.log(`[DB] MongoDB Connected successfully: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`[DB ERROR] MongoDB Connection Failed: ${error.message}`);
    throw error;
  }
};

/**
 * Close MongoDB connection cleanly
 * @returns {Promise<void>}
 */
const closeDB = async () => {
  try {
    await mongoose.connection.close();
    console.log('[DB] MongoDB connection closed cleanly');
  } catch (error) {
    console.error(`[DB ERROR] Error closing MongoDB connection: ${error.message}`);
  }
};

module.exports = {
  connectDB,
  closeDB,
};
