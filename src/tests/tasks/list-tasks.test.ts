import request from 'supertest';
import { app } from '../../app.js';
import { describe, it, expect } from '@jest/globals';
import 'dotenv/config';
import { adminLogin } from '../admin-login.js';
import { memberLogin } from '../member-login.js';

describe('GET /teams/:teamID/tasks', () => {
  const teamId = 2; // Ensure this team exists in the database
  // const adminId = 1; // Ensure this user exists and is a admin
  // const memberId = 2; // Ensure this user exists and is a member of the team
  const notMemberTeamId = 1; // Ensure this team exists but the member is not part of it

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

  function expectFilteredTasks(
    tasks: { status: string; priority: string }[],
    filters: { status?: string; priority?: string },
  ) {
    expect(Array.isArray(tasks)).toBe(true);

    for (const task of tasks) {
      if (filters.status) {
        expect(task.status).toBe(filters.status);
      }

      if (filters.priority) {
        expect(task.priority).toBe(filters.priority);
      }
    }
  }

  it('should return a list of tasks for the team when requested by an admin', async () => {
    const response = await request(app)
      .get(`/teams/${teamId}/tasks`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body.tasks)).toBe(true);
  });

  it('should return a list of tasks for the team when requested by a member of the team', async () => {
    const response = await request(app)
      .get(`/teams/${teamId}/tasks`)
      .set('Authorization', `Bearer ${memberToken}`);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body.tasks)).toBe(true);
  });

  it('should return 403 if a member who is not part of the team tries to access the tasks', async () => {
    const response = await request(app)
      .get(`/teams/${notMemberTeamId}/tasks`)
      .set('Authorization', `Bearer ${memberToken}`);

    expect(response.status).toBe(403);
    expect(response.body.message).toBe('User is not a member of the team');
  });

  it('should return 404 if the team does not exist', async () => {
    const response = await request(app)
      .get(`/teams/9999/tasks`)
      .set('Authorization', `Bearer ${memberToken}`);

    expect(response.status).toBe(404);
    expect(response.body.message).toBe('Team not found');
  });

  it('should filter tasks by status', async () => {
    const response = await request(app)
      .get(`/teams/${teamId}/tasks?status=in_progress`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
    expectFilteredTasks(response.body.tasks, { status: 'in_progress' });
  });

  it('should filter tasks by priority', async () => {
    const response = await request(app)
      .get(`/teams/${teamId}/tasks?priority=medium`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
    expectFilteredTasks(response.body.tasks, { priority: 'medium' });
  });

  it('should filter tasks by status and priority together', async () => {
    const response = await request(app)
      .get(`/teams/${teamId}/tasks?status=in_progress&priority=medium`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
    expectFilteredTasks(response.body.tasks, { status: 'in_progress', priority: 'medium' });
  });
});
