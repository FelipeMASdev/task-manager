import request from 'supertest';
import { app } from '../../app.js';
import { describe, it, expect } from '@jest/globals';
import 'dotenv/config';
import { adminLogin } from '../admin-login.js';
import { memberLogin } from '../member-login.js';

describe('GET /teams/:teamID/tasks/:taskID/history', () => {
  const teamId = 2; // Ensure this team exists in the database
  // const adminId = 1; // Ensure this user exists and is a admin
  // const memberId = 2; // Ensure this user exists and is a member of the team
  const notMemberTeamId = 1; // Ensure this team exists but the member is not part of it
  const taskId = 4; // Ensure this task exists in the database and belongs to the team
  const otherTeamTaskId = 5; // Ensure this task exists but belongs to a different team

  let adminToken: string | undefined;
  let memberToken: string | undefined;

  beforeAll(async () => {
    adminToken = await adminLogin();
    memberToken = await memberLogin();
  });

  afterAll(async () => {
    adminToken = undefined;
    memberToken = undefined;
  });

  it('should return the task history when requested by an admin', async () => {
    const response = await request(app)
      .get(`/teams/${teamId}/tasks/${taskId}/history`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('task');
    expect(response.body).toHaveProperty('taskHistory');
    expect(Array.isArray(response.body.taskHistory)).toBe(true);
  });

  it('should return the task history when requested by a member of the team', async () => {
    const response = await request(app)
      .get(`/teams/${teamId}/tasks/${taskId}/history`)
      .set('Authorization', `Bearer ${memberToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('task');
    expect(response.body).toHaveProperty('taskHistory');
    expect(Array.isArray(response.body.taskHistory)).toBe(true);
  });

  it('should return 403 if a member who is not part of the team tries to access the task history', async () => {
    const response = await request(app)
      .get(`/teams/${notMemberTeamId}/tasks/${otherTeamTaskId}/history`)
      .set('Authorization', `Bearer ${memberToken}`);

    expect(response.status).toBe(403);
    expect(response.body.message).toBe('User is not a member of the specified team');
  });

  it('should return 404 if the team does not exist', async () => {
    const response = await request(app)
      .get(`/teams/9999/tasks/${taskId}/history`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(404);
    expect(response.body.message).toBe('Team not found');
  });

  it('should return 404 if the task does not exist in the team', async () => {
    const response = await request(app)
      .get(`/teams/${teamId}/tasks/9999/history`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(404);
    expect(response.body.message).toBe('Task not found in the specified team');
  });

  it('should throw a validation error if the teamID or taskID is not a number', async () => {
    const response = await request(app)
      .get(`/teams/invalid/tasks/invalid/history`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Validation error');
  });
});
