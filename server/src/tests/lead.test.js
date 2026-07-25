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

const leadService = require('../services/lead.service');
const leadActivityService = require('../services/leadActivity.service');
const tokenUtils = require('../utils/token.utils');
const app = require('../app');

describe('Lead Management Backend API & RBAC Integration', () => {
  let adminToken;
  let memberToken;
  let unassignedMemberToken;

  beforeAll(() => {
    jest.spyOn(dotenv, 'config').mockImplementation(() => {});

    adminToken = tokenUtils.generateAccessToken({
      id: '507f1f77bcf86cd799439011',
      email: 'admin@example.com',
      role: 'admin',
    });

    memberToken = tokenUtils.generateAccessToken({
      id: '507f1f77bcf86cd799439022',
      email: 'member@example.com',
      role: 'member',
    });

    unassignedMemberToken = tokenUtils.generateAccessToken({
      id: '507f1f77bcf86cd799439033',
      email: 'other_member@example.com',
      role: 'member',
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('POST /api/leads - Create Lead', () => {
    test('Admin - 201 Created with valid payload', async () => {
      const mockLead = {
        _id: '607f1f77bcf86cd7994390aa',
        name: 'Acme Corp',
        email: 'contact@acme.com',
        phone: '1234567890',
        company: 'Acme Inc',
        status: 'New',
        createdBy: '507f1f77bcf86cd799439011',
      };
      jest.spyOn(leadService, 'createLead').mockResolvedValue(mockLead);

      const res = await request(app)
        .post('/api/leads')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Acme Corp',
          email: 'contact@acme.com',
          phone: '1234567890',
          company: 'Acme Inc',
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('Acme Corp');
    });

    test('Member - 403 Forbidden on create attempt', async () => {
      const res = await request(app)
        .post('/api/leads')
        .set('Authorization', `Bearer ${memberToken}`)
        .send({
          name: 'Acme Corp',
          email: 'contact@acme.com',
          phone: '1234567890',
        });

      expect(res.statusCode).toBe(403);
      expect(res.body.success).toBe(false);
    });

    test('Admin - 400 Bad Request on invalid email/phone', async () => {
      const res = await request(app)
        .post('/api/leads')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: '',
          email: 'invalid-email',
          phone: '',
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.errors).toBeDefined();
    });
  });

  describe('GET /api/leads - List Leads with Pagination, Search & Filters', () => {
    test('Admin - 200 OK returns paginated list', async () => {
      const mockResult = {
        leads: [
          { _id: '607f1f77bcf86cd7994390aa', name: 'Acme Corp', status: 'New' },
        ],
        pagination: { total: 1, page: 1, limit: 10, totalPages: 1 },
      };
      jest.spyOn(leadService, 'getLeads').mockResolvedValue(mockResult);

      const res = await request(app)
        .get('/api/leads?page=1&limit=10&search=Acme&status=New')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.leads).toHaveLength(1);
      expect(res.body.data.pagination.total).toBe(1);
    });

    test('Member - 200 OK receives assigned leads only', async () => {
      const mockResult = {
        leads: [
          {
            _id: '607f1f77bcf86cd7994390aa',
            name: 'Assigned Lead',
            assignedTo: '507f1f77bcf86cd799439022',
          },
        ],
        pagination: { total: 1, page: 1, limit: 10, totalPages: 1 },
      };
      jest.spyOn(leadService, 'getLeads').mockResolvedValue(mockResult);

      const res = await request(app)
        .get('/api/leads')
        .set('Authorization', `Bearer ${memberToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('GET /api/leads/:id - Single Lead Details', () => {
    test('Admin - 200 OK gets lead and notes', async () => {
      const mockData = {
        lead: { _id: '607f1f77bcf86cd7994390aa', name: 'Acme Corp' },
        notes: [{ _id: 'note1', note: 'First call done' }],
      };
      jest.spyOn(leadService, 'getLeadById').mockResolvedValue(mockData);

      const res = await request(app)
        .get('/api/leads/607f1f77bcf86cd7994390aa')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.lead.name).toBe('Acme Corp');
    });
  });

  describe('PATCH /api/leads/:id - Update Lead', () => {
    test('Admin - 200 OK updates any field', async () => {
      const updatedLead = {
        _id: '607f1f77bcf86cd7994390aa',
        name: 'Updated Acme',
        status: 'Contacted',
      };
      jest.spyOn(leadService, 'updateLead').mockResolvedValue(updatedLead);

      const res = await request(app)
        .patch('/api/leads/607f1f77bcf86cd7994390aa')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Updated Acme', status: 'Contacted' });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('Contacted');
    });

    test('Member - 200 OK updates status on assigned lead', async () => {
      const updatedLead = {
        _id: '607f1f77bcf86cd7994390aa',
        status: 'Qualified',
      };
      jest.spyOn(leadService, 'updateLead').mockResolvedValue(updatedLead);

      const res = await request(app)
        .patch('/api/leads/607f1f77bcf86cd7994390aa')
        .set('Authorization', `Bearer ${memberToken}`)
        .send({ status: 'Qualified' });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('Qualified');
    });
  });

  describe('PATCH /api/leads/:id/assign - Assign Lead', () => {
    test('Admin - 200 OK assigns lead to member', async () => {
      const assignedLead = {
        _id: '607f1f77bcf86cd7994390aa',
        assignedTo: '507f1f77bcf86cd799439022',
      };
      jest.spyOn(leadService, 'assignLead').mockResolvedValue(assignedLead);

      const res = await request(app)
        .patch('/api/leads/607f1f77bcf86cd7994390aa/assign')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ assignedTo: '507f1f77bcf86cd799439022' });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.assignedTo).toBe('507f1f77bcf86cd799439022');
    });

    test('Member - 403 Forbidden on assign attempt', async () => {
      const res = await request(app)
        .patch('/api/leads/607f1f77bcf86cd7994390aa/assign')
        .set('Authorization', `Bearer ${memberToken}`)
        .send({ assignedTo: '507f1f77bcf86cd799439022' });

      expect(res.statusCode).toBe(403);
      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/leads/:id/notes - Add Note', () => {
    test('Assigned Member - 201 Created adds note to lead', async () => {
      const newNote = {
        _id: 'note123',
        lead: '607f1f77bcf86cd7994390aa',
        note: 'Follow-up call scheduled for Monday',
      };
      jest.spyOn(leadService, 'addNote').mockResolvedValue(newNote);

      const res = await request(app)
        .post('/api/leads/607f1f77bcf86cd7994390aa/notes')
        .set('Authorization', `Bearer ${memberToken}`)
        .send({ note: 'Follow-up call scheduled for Monday' });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.note).toBe('Follow-up call scheduled for Monday');
    });
  });

  describe('GET /api/leads/:id/activity - Get Activity Logs', () => {
    test('Admin - 200 OK returns activity history', async () => {
      jest.spyOn(leadService, 'getLeadById').mockResolvedValue({ lead: {} });
      const mockActivities = [
        { _id: 'act1', action: 'Lead Created' },
        { _id: 'act2', action: 'Status Changed' },
      ];
      jest
        .spyOn(leadActivityService, 'getLeadActivities')
        .mockResolvedValue(mockActivities);

      const res = await request(app)
        .get('/api/leads/607f1f77bcf86cd7994390aa/activity')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(2);
    });
  });

  describe('DELETE /api/leads/:id - Delete Lead', () => {
    test('Admin - 200 OK deletes lead', async () => {
      jest.spyOn(leadService, 'deleteLead').mockResolvedValue(true);

      const res = await request(app)
        .delete('/api/leads/607f1f77bcf86cd7994390aa')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Lead deleted successfully');
    });

    test('Member - 403 Forbidden on delete attempt', async () => {
      const res = await request(app)
        .delete('/api/leads/607f1f77bcf86cd7994390aa')
        .set('Authorization', `Bearer ${memberToken}`);

      expect(res.statusCode).toBe(403);
      expect(res.body.success).toBe(false);
    });
  });
});
