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

describe('Task API & Ownership Enforcement', () => {
  it('POST /api/tasks should create a valid task owned by authenticated user', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${tokenUserA}`)
      .send({
        title: 'Design Database Schema',
        description: 'Create Mongoose models for users and tasks',
        status: 'IN_PROGRESS',
        priority: 'HIGH',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.title).toBe('Design Database Schema');
    expect(res.body.data.status).toBe('IN_PROGRESS');
    expect(res.body.data.priority).toBe('HIGH');
  });

  it('POST /api/tasks without token should return 401 Unauthorized', async () => {
    const res = await request(app).post('/api/tasks').send({
      title: 'Unauthenticated Task',
    });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('POST /api/tasks with missing title should return 400 Validation Error', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${tokenUserA}`)
      .send({
        description: 'Missing title task',
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('POST /api/tasks with invalid status enum should return 400 Validation Error', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${tokenUserA}`)
      .send({
        title: 'Test Task',
        status: 'INVALID_STATUS',
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('POST /api/tasks with invalid priority enum should return 400 Validation Error', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${tokenUserA}`)
      .send({
        title: 'Test Task',
        priority: 'URGENT_INVALID',
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('GET /api/tasks should list only authenticated user tasks', async () => {
    // User A task
    await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${tokenUserA}`)
      .send({ title: 'User A Task' });

    // User B task
    await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${tokenUserB}`)
      .send({ title: 'User B Task' });

    const resA = await request(app)
      .get('/api/tasks')
      .set('Authorization', `Bearer ${tokenUserA}`);

    expect(resA.status).toBe(200);
    expect(resA.body.data.length).toBe(1);
    expect(resA.body.data[0].title).toBe('User A Task');
  });

  it('GET /api/tasks/:id should retrieve owned task', async () => {
    const createRes = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${tokenUserA}`)
      .send({ title: 'Get Owned Task' });

    const taskId = createRes.body.data._id;
    const res = await request(app)
      .get(`/api/tasks/${taskId}`)
      .set('Authorization', `Bearer ${tokenUserA}`);

    expect(res.status).toBe(200);
    expect(res.body.data.title).toBe('Get Owned Task');
  });

  it('GET /api/tasks/:id with non-existent ObjectId should return 404', async () => {
    const fakeId = new mongoose.Types.ObjectId().toString();
    const res = await request(app)
      .get(`/api/tasks/${fakeId}`)
      .set('Authorization', `Bearer ${tokenUserA}`);

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  it('GET /api/tasks/:id with malformed ObjectId should return 400 Bad Request', async () => {
    const res = await request(app)
      .get('/api/tasks/invalid-object-id')
      .set('Authorization', `Bearer ${tokenUserA}`);

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('PATCH /api/tasks/:id should update owned task', async () => {
    const createRes = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${tokenUserA}`)
      .send({ title: 'Original Title' });

    const taskId = createRes.body.data._id;

    const res = await request(app)
      .patch(`/api/tasks/${taskId}`)
      .set('Authorization', `Bearer ${tokenUserA}`)
      .send({ title: 'Updated Title', status: 'COMPLETED' });

    expect(res.status).toBe(200);
    expect(res.body.data.title).toBe('Updated Title');
    expect(res.body.data.status).toBe('COMPLETED');
  });

  it('PATCH /api/tasks/:id should reject owner modification attempts', async () => {
    const createRes = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${tokenUserA}`)
      .send({ title: 'Task for User A' });

    const taskId = createRes.body.data._id;
    const fakeOwnerId = new mongoose.Types.ObjectId().toString();

    // Client passes owner in update body, server schema should strip or reject owner change
    await request(app)
      .patch(`/api/tasks/${taskId}`)
      .set('Authorization', `Bearer ${tokenUserA}`)
      .send({ owner: fakeOwnerId });

    const getRes = await request(app)
      .get(`/api/tasks/${taskId}`)
      .set('Authorization', `Bearer ${tokenUserA}`);

    expect(getRes.body.data.owner).not.toBe(fakeOwnerId);
  });

  it('PATCH /api/tasks/:id should reject unknown update properties in strict mode', async () => {
    const createRes = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${tokenUserA}`)
      .send({ title: 'Strict Schema Test' });

    const taskId = createRes.body.data._id;

    const res = await request(app)
      .patch(`/api/tasks/${taskId}`)
      .set('Authorization', `Bearer ${tokenUserA}`)
      .send({ title: 'Valid Title', unknownProp: 'hack' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('DELETE /api/tasks/:id should delete owned task and confirm it is gone', async () => {
    const createRes = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${tokenUserA}`)
      .send({ title: 'Task to Delete' });

    const taskId = createRes.body.data._id;

    const deleteRes = await request(app)
      .delete(`/api/tasks/${taskId}`)
      .set('Authorization', `Bearer ${tokenUserA}`);

    expect(deleteRes.status).toBe(200);

    const getRes = await request(app)
      .get(`/api/tasks/${taskId}`)
      .set('Authorization', `Bearer ${tokenUserA}`);

    expect(getRes.status).toBe(404);
  });

  it('GET /api/tasks should handle regex special characters safely in title search', async () => {
    await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${tokenUserA}`)
      .send({ title: 'Fix (bug) [URGENT] + test?' });

    const searchStr = encodeURIComponent('(bug) [URGENT] + test?');
    const res = await request(app)
      .get(`/api/tasks?search=${searchStr}`)
      .set('Authorization', `Bearer ${tokenUserA}`);

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(1);
    expect(res.body.data[0].title).toBe('Fix (bug) [URGENT] + test?');
  });

  it('GET /api/tasks should support combined search, status, priority filters, and pagination', async () => {
    await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${tokenUserA}`)
      .send({ title: 'Deploy API', status: 'PENDING', priority: 'HIGH' });

    await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${tokenUserA}`)
      .send({ title: 'Deploy UI', status: 'PENDING', priority: 'HIGH' });

    await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${tokenUserA}`)
      .send({ title: 'Deploy Docs', status: 'COMPLETED', priority: 'HIGH' });

    const res = await request(app)
      .get('/api/tasks?search=Deploy&status=PENDING&priority=HIGH&page=1&limit=1')
      .set('Authorization', `Bearer ${tokenUserA}`);

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(1);
    expect(res.body.pagination.total).toBe(2);
    expect(res.body.pagination.totalPages).toBe(2);
  });

  it('CRITICAL OWNERSHIP: Cross-user GET returns 404', async () => {
    const createRes = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${tokenUserA}`)
      .send({ title: 'User A Private Task' });

    const taskId = createRes.body.data._id;

    const res = await request(app)
      .get(`/api/tasks/${taskId}`)
      .set('Authorization', `Bearer ${tokenUserB}`);

    expect(res.status).toBe(404);
    expect(res.body.error.message).toBe('Task not found');
  });

  it('CRITICAL OWNERSHIP: Cross-user PATCH returns 404', async () => {
    const createRes = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${tokenUserA}`)
      .send({ title: 'User A Private Task' });

    const taskId = createRes.body.data._id;

    const res = await request(app)
      .patch(`/api/tasks/${taskId}`)
      .set('Authorization', `Bearer ${tokenUserB}`)
      .send({ title: 'Hacked Title' });

    expect(res.status).toBe(404);
    expect(res.body.error.message).toBe('Task not found');
  });

  it('CRITICAL OWNERSHIP: Cross-user DELETE returns 404', async () => {
    const createRes = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${tokenUserA}`)
      .send({ title: 'User A Private Task' });

    const taskId = createRes.body.data._id;

    const res = await request(app)
      .delete(`/api/tasks/${taskId}`)
      .set('Authorization', `Bearer ${tokenUserB}`);

    expect(res.status).toBe(404);
    expect(res.body.error.message).toBe('Task not found');
  });

  it('CRITICAL OWNERSHIP: Unauthorized attempts do not modify or delete original task', async () => {
    const createRes = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${tokenUserA}`)
      .send({ title: 'Original User A Title' });

    const taskId = createRes.body.data._id;

    // User B attempts attack
    await request(app)
      .patch(`/api/tasks/${taskId}`)
      .set('Authorization', `Bearer ${tokenUserB}`)
      .send({ title: 'Malicious Update' });

    await request(app)
      .delete(`/api/tasks/${taskId}`)
      .set('Authorization', `Bearer ${tokenUserB}`);

    // Verify task is completely unchanged for User A
    const getRes = await request(app)
      .get(`/api/tasks/${taskId}`)
      .set('Authorization', `Bearer ${tokenUserA}`);

    expect(getRes.status).toBe(200);
    expect(getRes.body.data.title).toBe('Original User A Title');
  });
});
