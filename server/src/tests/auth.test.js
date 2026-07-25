const request = require('supertest');
const dotenv = require('dotenv');

// Set environment variables prior to module imports
process.env.PORT = '5000';
process.env.NODE_ENV = 'test';
process.env.MONGO_URI = 'mongodb://localhost:27017/test_db';
process.env.CLIENT_URL = 'http://localhost:3000';
process.env.ACCESS_TOKEN_SECRET = 'test_access_secret_key_32_bytes_long!!';
process.env.REFRESH_TOKEN_SECRET = 'test_refresh_secret_key_32_bytes_long!';
process.env.ACCESS_TOKEN_EXPIRY = '15m';
process.env.REFRESH_TOKEN_EXPIRY = '7d';

const authService = require('../services/auth.service');
const tokenUtils = require('../utils/token.utils');
const app = require('../app');

describe('JWT Authentication API & Middleware', () => {
  beforeAll(() => {
    jest.spyOn(dotenv, 'config').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Validation & Middleware', () => {
    test('POST /api/auth/register - 400 Bad Request on invalid payload', async () => {
      const res = await request(app).post('/api/auth/register').send({
        name: '',
        email: 'not-an-email',
        password: '123',
      });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Validation failed');
      expect(res.body.errors).toBeDefined();
    });

    test('POST /api/auth/login - 400 Bad Request on missing fields', async () => {
      const res = await request(app).post('/api/auth/login').send({});

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Validation failed');
    });

    test('GET /api/auth/me - 401 Unauthorized when missing Bearer token', async () => {
      const res = await request(app).get('/api/auth/me');

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Access token is required');
    });

    test('GET /api/auth/me - 401 Unauthorized when token is invalid', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalidtoken123');

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Invalid or expired access token');
    });
  });

  describe('Auth Controller & Routes Integration', () => {
    test('POST /api/auth/register - 201 Created with JSON payload and HttpOnly cookie', async () => {
      const mockResult = {
        user: { _id: '123', name: 'John Doe', email: 'john@example.com', role: 'member' },
        accessToken: 'mock_access_token_123',
        refreshToken: 'mock_refresh_token_123',
      };
      jest.spyOn(authService, 'registerUser').mockResolvedValue(mockResult);

      const res = await request(app).post('/api/auth/register').send({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
      });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe('john@example.com');
      expect(res.body.data.accessToken).toBe('mock_access_token_123');

      const cookies = res.headers['set-cookie'];
      expect(cookies).toBeDefined();
      expect(cookies[0]).toContain('refreshToken=mock_refresh_token_123');
      expect(cookies[0]).toContain('HttpOnly');
    });

    test('POST /api/auth/login - 200 OK with JSON payload and HttpOnly cookie', async () => {
      const mockResult = {
        user: { _id: '123', name: 'John Doe', email: 'john@example.com', role: 'member' },
        accessToken: 'mock_access_token_123',
        refreshToken: 'mock_refresh_token_123',
      };
      jest.spyOn(authService, 'loginUser').mockResolvedValue(mockResult);

      const res = await request(app).post('/api/auth/login').send({
        email: 'john@example.com',
        password: 'password123',
      });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe('john@example.com');
      expect(res.body.data.accessToken).toBe('mock_access_token_123');

      const cookies = res.headers['set-cookie'];
      expect(cookies).toBeDefined();
      expect(cookies[0]).toContain('refreshToken=mock_refresh_token_123');
      expect(cookies[0]).toContain('HttpOnly');
    });

    test('POST /api/auth/refresh - 200 OK with rotated refresh token and new access token', async () => {
      const mockResult = {
        accessToken: 'new_access_token_456',
        refreshToken: 'new_refresh_token_456',
      };
      jest.spyOn(authService, 'refreshAccessToken').mockResolvedValue(mockResult);

      const res = await request(app)
        .post('/api/auth/refresh')
        .set('Cookie', 'refreshToken=old_refresh_token_123');

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.accessToken).toBe('new_access_token_456');

      const cookies = res.headers['set-cookie'];
      expect(cookies).toBeDefined();
      expect(cookies[0]).toContain('refreshToken=new_refresh_token_456');
    });

    test('GET /api/auth/me - 200 OK for authenticated user profile', async () => {
      const validAccessToken = tokenUtils.generateAccessToken({
        id: '123',
        email: 'john@example.com',
        role: 'member',
      });

      const mockUser = {
        _id: '123',
        name: 'John Doe',
        email: 'john@example.com',
        role: 'member',
      };
      jest.spyOn(authService, 'getCurrentUser').mockResolvedValue(mockUser);

      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${validAccessToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe('john@example.com');
    });

    test('POST /api/auth/logout - 200 OK clears HttpOnly cookie', async () => {
      jest.spyOn(authService, 'logoutUser').mockResolvedValue();

      const res = await request(app).post('/api/auth/logout');

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Logged out successfully');

      const cookies = res.headers['set-cookie'];
      expect(cookies[0]).toContain('refreshToken=;');
    });
  });
});
