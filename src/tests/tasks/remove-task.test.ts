import request from 'supertest';
import { app } from '../../app.js';
import { describe, it, expect } from '@jest/globals';
import { prisma } from '@/prisma.js';
import 'dotenv/config';
import { adminLogin } from '../admin-login.js';

describe('DELETE /teams/:teamID/tasks/:taskID', () => {
  const teamId = 1; // Ensure this team exists in the database

  let token: string | undefined;
  let taskId: number | undefined;

  beforeAll(async () => {
    token = await adminLogin();

    const createdTask = await prisma.task.create({
      data: {
        title: 'Task to be deleted',
        description: 'This task will be deleted in the test',
        teamId: teamId,
      },
    });
    taskId = createdTask.id;
  });

  afterAll(async () => {
    token = undefined;
  });

  it('should confirm the team exists', async () => {
    const team = await prisma.team.findUnique({
      where: { id: teamId },
    });
    expect(team).toBeDefined();
  });

  it('should delete a task successfully', async () => {
    const response = await request(app)
      .delete(`/teams/${teamId}/tasks/${taskId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.message).toContain(
      `Task 'Task to be deleted' with ID ${taskId} deleted successfully`,
    );
  });

  it('should return an error when trying to delete a non-existent task', async () => {
    const response = await request(app)
      .delete(`/teams/${teamId}/tasks/9999`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(404);
    expect(response.body.message).toBe('Task not found in the specified team');
  });

  it('should return an error when trying to delete a task from a non-existent team', async () => {
    const response = await request(app)
      .delete(`/teams/9999/tasks/${taskId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(404);
    expect(response.body.message).toBe('Team not found');
  });

  it('should return an error when taskID is not a number', async () => {
    const response = await request(app)
      .delete(`/teams/${teamId}/tasks/invalidTaskID`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Validation error');
  });
});
