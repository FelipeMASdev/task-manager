import request from 'supertest';
import { app } from '../../app.js';
import { describe, it, expect } from '@jest/globals';
import { prisma } from '@/prisma.js';
import 'dotenv/config';
import { adminLogin } from '../admin-login.js';

describe('POST /teams/:teamID/tasks', () => {
  const teamId = 1; //  Ensure this team exists in the database
  const userId = 1; // Ensure this user exists and is a member of the team
  const nonMemberUserId = 2; // Ensure this user exists but is not a member of the team

  let token: string | undefined;
  let createdTaskId: number | undefined;

  beforeAll(async () => {
    token = await adminLogin();
  });

  afterAll(async () => {
    token = undefined;

    if (createdTaskId) {
      await prisma.task.delete({
        where: { id: createdTaskId },
      });
    }

    createdTaskId = undefined;
  });

  it('should confirm the team and user exist', async () => {
    const team = await prisma.team.findUnique({
      where: { id: teamId },
    });
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    expect(team).toBeDefined();
    expect(user).toBeDefined();
  });

  it('should create a task successfully', async () => {
    const response = await request(app)
      .post(`/teams/${teamId}/tasks`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Test Task',
        description: 'This is a test task description',
        priority: 'medium',
        assignedTo: userId,
      });

    createdTaskId = response.body.task?.id;

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('message', 'Task created successfully');
    expect(response.body).toHaveProperty('task');
    expect(response.body.task).toHaveProperty('id');
  });

  it('should return 404 if team does not exist', async () => {
    const response = await request(app)
      .post(`/teams/9999/tasks`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Test Task',
        description: 'This is a test task description',
        priority: 'medium',
        assignedTo: userId,
      });

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('message', 'Team not found');
  });

  it('should return 404 if assigned user does not exist', async () => {
    const response = await request(app)
      .post(`/teams/${teamId}/tasks`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Test Task',
        description: 'This is a test task description',
        priority: 'medium',
        assignedTo: 9999, // Non-existent user ID
      });

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('message', 'User not found');
  });

  it('should return 400 if assigned user is not a member of the team', async () => {
    const response = await request(app)
      .post(`/teams/${teamId}/tasks`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Test Task',
        description: 'This is a test task description',
        priority: 'medium',
        assignedTo: nonMemberUserId,
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('User is not a member of the team');
  });

  it('should return 400 for invalid team ID', async () => {
    const response = await request(app)
      .post(`/teams/invalid/tasks`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Test Task',
        description: 'This is a test task description',
        priority: 'medium',
        assignedTo: userId,
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Validation error');
  });
});
