const serverModule = require('./src/server');

if (require.main === module) {
  serverModule.startServer();
}

module.exports = serverModule;
