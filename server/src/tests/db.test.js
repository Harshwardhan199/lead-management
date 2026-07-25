describe('Database Connection Module', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  test('should attempt connection with MONGO_URI from env', async () => {
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

    const mongoose = require('mongoose');
    const connectSpy = jest.spyOn(mongoose, 'connect').mockResolvedValueOnce({
      connection: { host: 'localhost' },
    });

    const { connectDB } = require('../config/db');
    const conn = await connectDB();

    expect(connectSpy).toHaveBeenCalledWith('mongodb://localhost:27017/test_db');
    expect(conn.connection.host).toBe('localhost');
  });

  test('should handle connection failure and re-throw error', async () => {
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

    const mongoose = require('mongoose');
    jest.spyOn(mongoose, 'connect').mockRejectedValueOnce(new Error('Connection Failed'));

    const { connectDB } = require('../config/db');

    await expect(connectDB()).rejects.toThrow('Connection Failed');
  });
});
