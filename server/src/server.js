const env = require('./config/env');
const { connectDB, closeDB } = require('./config/db');
const app = require('./app');

let server;

/**
 * Start the Express server after connecting to MongoDB
 */
const startServer = async () => {
  try {
    // Connect to MongoDB before starting Express
    await connectDB();

    // Start Express listener
    const PORT = env.PORT;
    server = app.listen(PORT, () => {
      console.log(`[SERVER] Express server running in ${env.NODE_ENV} mode on port ${PORT}`);
    });
    return server;
  } catch (error) {
    console.error(`[FATAL] Server initialization failed: ${error.message}`);
    process.exit(1);
  }
};

/**
 * Handle graceful shutdown on process termination signals
 * @param {string} signal
 */
const handleShutdown = async (signal) => {
  console.log(`\n[SERVER] ${signal} signal received. Initiating graceful shutdown...`);

  const forceExitTimeout = setTimeout(() => {
    console.error('[SERVER] Forced shutdown due to timeout');
    process.exit(1);
  }, 10000);

  try {
    if (server && typeof server.close === 'function') {
      await new Promise((resolve) => {
        server.close(() => {
          resolve();
        });
      });
      console.log('[SERVER] Express HTTP server stopped');
    }

    await closeDB();
    clearTimeout(forceExitTimeout);
    console.log('[SERVER] Graceful shutdown completed cleanly');
  } catch (error) {
    console.error(`[SERVER ERROR] Error during shutdown: ${error.message}`);
    clearTimeout(forceExitTimeout);
    process.exit(1);
  }

  process.exit(0);
};

// Signal listeners for SIGINT and SIGTERM
process.on('SIGINT', () => handleShutdown('SIGINT'));
process.on('SIGTERM', () => handleShutdown('SIGTERM'));

// Execute server start if run directly
if (require.main === module) {
  startServer();
}

module.exports = {
  app,
  startServer,
  handleShutdown,
};
