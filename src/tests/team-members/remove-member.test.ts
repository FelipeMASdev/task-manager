import request from 'supertest';
import { app } from '../../app.js';
import { describe, it, expect } from '@jest/globals';
import { prisma } from '@/prisma.js';
import 'dotenv/config';
import { adminLogin } from '../admin-login.js';

describe('DELETE /teams/:teamID/members', () => {
  let token: string | undefined;

  // ensure these exist in the test database before running tests
  const teamId = 1;
  const userId = 3;

  beforeAll(async () => {
    token = await adminLogin();

    await request(app)
      .post(`/teams/${teamId}/members`)
      .set('Authorization', `Bearer ${token}`)
      .send({ userID: userId });
  });

  afterAll(async () => {
    token = undefined;
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

  it('should remove a member from the team', async () => {
    const response = await request(app)
      .delete(`/teams/${teamId}/members/${userId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
  });

  it('should return 404 if team does not exist', async () => {
    const response = await request(app)
      .delete(`/teams/9999/members/${userId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(404);
    expect(response.body.message).toBe('Team not found');
  });

  it('should return 404 if user does not exist', async () => {
    const response = await request(app)
      .delete(`/teams/${teamId}/members/9999`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(404);
    expect(response.body.message).toBe('User not found');
  });

  it('should return 404 if user is not a member of the team', async () => {
    const response = await request(app)
      .delete(`/teams/${teamId}/members/${userId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(404);
    expect(response.body.message).toBe('User is not a member of this team');
  });

  it('should return 400 for invalid team ID', async () => {
    const response = await request(app)
      .delete(`/teams/invalid/members/${userId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Validation error');
  });

  it('should return 400 for invalid user ID', async () => {
    const response = await request(app)
      .delete(`/teams/${teamId}/members/invalid`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Validation error');
  });
});
