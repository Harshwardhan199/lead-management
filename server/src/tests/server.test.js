const mongoose = require('mongoose');
const dotenv = require('dotenv');

describe('Server Entrypoint & Lifecycle', () => {
  let exitSpy;

  beforeEach(() => {
    jest.resetModules();
    const dotenv = require('dotenv');
    jest.spyOn(dotenv, 'config').mockImplementation(() => {});

    process.env = {
      PORT: '5000',
      NODE_ENV: 'test',
      MONGO_URI: 'mongodb://localhost:27017/test_db',
      CLIENT_URL: 'http://localhost:3000',
      ACCESS_TOKEN_SECRET: 'test_access_secret',
      REFRESH_TOKEN_SECRET: 'test_refresh_secret',
      ACCESS_TOKEN_EXPIRY: '15m',
      REFRESH_TOKEN_EXPIRY: '7d',
    };

    exitSpy = jest.spyOn(process, 'exit').mockImplementation((code) => {
      throw new Error(`process.exit: ${code}`);
    });
    jest.spyOn(console, 'error').mockImplementation((...args) => {
      console.log('[TEST CONSOLE ERROR]', ...args);
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('startServer should connect to DB and start Express server', async () => {
    const dbModule = require('../config/db');
    const connectSpy = jest.spyOn(dbModule, 'connectDB').mockResolvedValueOnce({});
    const app = require('../app');
    const listenSpy = jest.spyOn(app, 'listen').mockImplementation((port, cb) => {
      if (cb) cb();
      return { close: jest.fn((cb) => cb && cb()) };
    });

    const { startServer } = require('../server');
    await startServer();

    expect(connectSpy).toHaveBeenCalled();
    expect(listenSpy).toHaveBeenCalledWith('5000', expect.any(Function));
  });

  test('startServer should gracefully exit process on DB connection failure', async () => {
    const dbModule = require('../config/db');
    jest.spyOn(dbModule, 'connectDB').mockRejectedValueOnce(new Error('DB Fail'));

    const { startServer } = require('../server');

    await expect(startServer()).rejects.toThrow('process.exit: 1');
    expect(exitSpy).toHaveBeenCalledWith(1);
  });

  test('handleShutdown should close HTTP server and DB connection cleanly', async () => {
    const dbModule = require('../config/db');
    jest.spyOn(dbModule, 'closeDB').mockResolvedValueOnce();

    const mongoose = require('mongoose');
    jest.spyOn(mongoose.connection, 'close').mockResolvedValueOnce();

    const { handleShutdown } = require('../server');

    await expect(handleShutdown('SIGINT')).rejects.toThrow('process.exit: 0');
    expect(exitSpy).toHaveBeenCalledWith(0);
  });
});
