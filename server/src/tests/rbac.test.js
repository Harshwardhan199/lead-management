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

const tokenUtils = require('../utils/token.utils');
const app = require('../app');

describe('Role-Based Access Control (RBAC) Middleware', () => {
  beforeAll(() => {
    jest.spyOn(dotenv, 'config').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('GET /api/auth/admin-only - should return 401 when unauthenticated', async () => {
    const res = await request(app).get('/api/auth/admin-only');

    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('Access token is required');
  });

  test('GET /api/auth/admin-only - should return 403 Forbidden for a member user', async () => {
    const memberAccessToken = tokenUtils.generateAccessToken({
      id: 'member123',
      email: 'member@example.com',
      role: 'member',
    });

    const res = await request(app)
      .get('/api/auth/admin-only')
      .set('Authorization', `Bearer ${memberAccessToken}`);

    expect(res.statusCode).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('Forbidden');
  });

  test('GET /api/auth/admin-only - should return 200 OK for an admin user', async () => {
    const adminAccessToken = tokenUtils.generateAccessToken({
      id: 'admin123',
      email: 'admin@example.com',
      role: 'admin',
    });

    const res = await request(app)
      .get('/api/auth/admin-only')
      .set('Authorization', `Bearer ${adminAccessToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.role).toBe('admin');
  });
});
