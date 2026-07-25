import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { app } from '../app.js';
import { User } from '../models/user.model.js';
import { Task } from '../models/task.model.js';

let mongoServer: MongoMemoryServer;
let tokenUserA: string;
let tokenUserB: string;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create({
    binary: {
      version: '4.4.18',
    },
  });
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.disconnect();
  if (mongoServer) {
    await mongoServer.stop();
  }
});

beforeEach(async () => {
  await User.deleteMany({});
  await Task.deleteMany({});

  // Register User A
  const resA = await request(app).post('/api/auth/register').send({
    name: 'User A',
    email: 'usera@example.com',
    password: 'password123',
  });
  tokenUserA = resA.body.data.token;

  // Register User B
  const resB = await request(app).post('/api/auth/register').send({
    name: 'User B',
    email: 'userb@example.com',
    password: 'password123',
  });
  tokenUserB = resB.body.data.token;
});

describe('Task API & Complete Backend Validation', () => {
  // 1. Valid task creation
  it('1. Valid task creation', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${tokenUserA}`)
      .send({
        title: 'Design Database Schema',
        description: 'Create Mongoose models for users and tasks',
        status: 'in_progress',
        priority: 'high',
        dueDate: '2026-12-31',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.title).toBe('Design Database Schema');
    expect(res.body.data.status).toBe('in_progress');
    expect(res.body.data.priority).toBe('high');
  });

  // 2. Missing title
  it('2. Missing title', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${tokenUserA}`)
      .send({
        description: 'Missing title task',
        status: 'todo',
        priority: 'medium',
        dueDate: '2026-12-31',
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(JSON.stringify(res.body)).toContain('Title is required');
  });

  // 3. Title containing only spaces
  it('3. Title containing only spaces', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${tokenUserA}`)
      .send({
        title: '   ',
        description: 'Whitespace title',
        status: 'todo',
        priority: 'medium',
        dueDate: '2026-12-31',
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(JSON.stringify(res.body)).toContain('Title is required');
  });

  // 4. Title longer than 120 characters
  it('4. Title longer than 120 characters', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${tokenUserA}`)
      .send({
        title: 'A'.repeat(121),
        description: 'Long title task',
        status: 'todo',
        priority: 'medium',
        dueDate: '2026-12-31',
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(JSON.stringify(res.body)).toContain('Title must not exceed 120 characters');
  });

  // 5. Missing description
  it('5. Missing description', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${tokenUserA}`)
      .send({
        title: 'Valid Title',
        status: 'todo',
        priority: 'medium',
        dueDate: '2026-12-31',
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(JSON.stringify(res.body)).toContain('Description is required');
  });

  // 6. Description containing only spaces
  it('6. Description containing only spaces', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${tokenUserA}`)
      .send({
        title: 'Valid Title',
        description: '    ',
        status: 'todo',
        priority: 'medium',
        dueDate: '2026-12-31',
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(JSON.stringify(res.body)).toContain('Description is required');
  });

  // 7. Description longer than 2,000 characters
  it('7. Description longer than 2,000 characters', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${tokenUserA}`)
      .send({
        title: 'Valid Title',
        description: 'D'.repeat(2001),
        status: 'todo',
        priority: 'medium',
        dueDate: '2026-12-31',
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(JSON.stringify(res.body)).toContain('Description must not exceed 2000 characters');
  });

  // 8. Missing status
  it('8. Missing status', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${tokenUserA}`)
      .send({
        title: 'Valid Title',
        description: 'Valid description',
        priority: 'medium',
        dueDate: '2026-12-31',
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(JSON.stringify(res.body)).toContain('Status is required');
  });

  // 9. Invalid status
  it('9. Invalid status', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${tokenUserA}`)
      .send({
        title: 'Valid Title',
        description: 'Valid description',
        status: 'pending',
        priority: 'medium',
        dueDate: '2026-12-31',
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(JSON.stringify(res.body)).toContain('Status must be To Do, In Progress, or Done');
  });

  // 10. Missing priority
  it('10. Missing priority', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${tokenUserA}`)
      .send({
        title: 'Valid Title',
        description: 'Valid description',
        status: 'todo',
        dueDate: '2026-12-31',
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(JSON.stringify(res.body)).toContain('Priority is required');
  });

  // 11. Invalid priority
  it('11. Invalid priority', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${tokenUserA}`)
      .send({
        title: 'Valid Title',
        description: 'Valid description',
        status: 'todo',
        priority: 'HIGH',
        dueDate: '2026-12-31',
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(JSON.stringify(res.body)).toContain('Priority must be Low, Medium, or High');
  });

  // 12. Missing due date
  it('12. Missing due date', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${tokenUserA}`)
      .send({
        title: 'Valid Title',
        description: 'Valid description',
        status: 'todo',
        priority: 'medium',
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(JSON.stringify(res.body)).toContain('Due date is required');
  });

  // 13. Invalid due date
  it('13. Invalid due date', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${tokenUserA}`)
      .send({
        title: 'Valid Title',
        description: 'Valid description',
        status: 'todo',
        priority: 'medium',
        dueDate: 'not-a-date',
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(JSON.stringify(res.body)).toContain('Please enter a valid due date');
  });

  // 14. Past due date
  it('14. Past due date', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${tokenUserA}`)
      .send({
        title: 'Valid Title',
        description: 'Valid description',
        status: 'todo',
        priority: 'medium',
        dueDate: '2020-01-01',
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(JSON.stringify(res.body)).toContain('Due date cannot be in the past');
  });

  // 15. Unknown field
  it('15. Unknown field', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${tokenUserA}`)
      .send({
        title: 'Valid Title',
        description: 'Valid description',
        status: 'todo',
        priority: 'medium',
        dueDate: '2026-12-31',
        unknownProperty: 'illegal',
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  // 16. Attempt to provide owner
  it('16. Attempt to provide owner', async () => {
    const fakeOwnerId = new mongoose.Types.ObjectId().toString();
    const res = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${tokenUserA}`)
      .send({
        title: 'Valid Title',
        description: 'Valid description',
        status: 'todo',
        priority: 'medium',
        dueDate: '2026-12-31',
        owner: fakeOwnerId,
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  // 17. Empty update body
  it('17. Empty update body', async () => {
    const createRes = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${tokenUserA}`)
      .send({
        title: 'Valid Title',
        description: 'Valid description',
        status: 'todo',
        priority: 'medium',
        dueDate: '2026-12-31',
      });

    const taskId = createRes.body.data._id;
    const res = await request(app)
      .patch(`/api/tasks/${taskId}`)
      .set('Authorization', `Bearer ${tokenUserA}`)
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(JSON.stringify(res.body)).toContain('At least one task field must be provided');
  });

  // 18. Invalid update field
  it('18. Invalid update field', async () => {
    const createRes = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${tokenUserA}`)
      .send({
        title: 'Valid Title',
        description: 'Valid description',
        status: 'todo',
        priority: 'medium',
        dueDate: '2026-12-31',
      });

    const taskId = createRes.body.data._id;
    const res = await request(app)
      .patch(`/api/tasks/${taskId}`)
      .set('Authorization', `Bearer ${tokenUserA}`)
      .send({ status: 'completed' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(JSON.stringify(res.body)).toContain('Status must be To Do, In Progress, or Done');
  });

  // 19. Valid partial update
  it('19. Valid partial update', async () => {
    const createRes = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${tokenUserA}`)
      .send({
        title: 'Valid Title',
        description: 'Valid description',
        status: 'todo',
        priority: 'medium',
        dueDate: '2026-12-31',
      });

    const taskId = createRes.body.data._id;
    const res = await request(app)
      .patch(`/api/tasks/${taskId}`)
      .set('Authorization', `Bearer ${tokenUserA}`)
      .send({ status: 'done', priority: 'high' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('done');
    expect(res.body.data.priority).toBe('high');
  });

  // 20. Request without authentication
  it('20. Request without authentication', async () => {
    const res = await request(app).post('/api/tasks').send({
      title: 'Unauthenticated Task',
      description: 'Test description',
      status: 'todo',
      priority: 'medium',
      dueDate: '2026-12-31',
    });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
});
