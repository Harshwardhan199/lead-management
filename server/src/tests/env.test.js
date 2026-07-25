describe('Environment Variable Configuration', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  test('should validate and export all required environment variables', () => {
    process.env.PORT = '5000';
    process.env.NODE_ENV = 'test';
    process.env.MONGO_URI = 'mongodb://localhost:27017/test_db';
    process.env.CLIENT_URL = 'http://localhost:3000';
    process.env.ACCESS_TOKEN_SECRET = 'test_access_secret';
    process.env.REFRESH_TOKEN_SECRET = 'test_refresh_secret';
    process.env.ACCESS_TOKEN_EXPIRY = '15m';
    process.env.REFRESH_TOKEN_EXPIRY = '7d';

    const env = require('../config/env');

    expect(env.PORT).toBe('5000');
    expect(env.NODE_ENV).toBe('test');
    expect(env.MONGO_URI).toBe('mongodb://localhost:27017/test_db');
    expect(env.CLIENT_URL).toBe('http://localhost:3000');
    expect(env.ACCESS_TOKEN_SECRET).toBe('test_access_secret');
    expect(env.REFRESH_TOKEN_SECRET).toBe('test_refresh_secret');
    expect(env.ACCESS_TOKEN_EXPIRY).toBe('15m');
    expect(env.REFRESH_TOKEN_EXPIRY).toBe('7d');
  });

  test('should throw an error if a required environment variable is missing', () => {
    const dotenv = require('dotenv');
    jest.spyOn(dotenv, 'config').mockImplementation(() => {});

    process.env = {
      PORT: '5000',
      NODE_ENV: 'test',
      // MONGO_URI is missing
      CLIENT_URL: 'http://localhost:3000',
      ACCESS_TOKEN_SECRET: 'test_access_secret',
      REFRESH_TOKEN_SECRET: 'test_refresh_secret',
      ACCESS_TOKEN_EXPIRY: '15m',
      REFRESH_TOKEN_EXPIRY: '7d',
    };

    expect(() => {
      require('../config/env');
    }).toThrow('[ENV ERROR] Missing required environment variable(s): MONGO_URI');
  });
});
