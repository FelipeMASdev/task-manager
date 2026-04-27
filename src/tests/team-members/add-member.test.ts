import request from 'supertest';
import { app } from '../../app.js';
import { describe, it, expect } from '@jest/globals';
import { prisma } from '@/prisma.js';
import 'dotenv/config';
import { adminLogin } from '../admin-login.js';

describe('POST /teams/:teamID/members', () => {
  let token: string | undefined;

  // ensure these exist in the test database before running tests
  const teamId = 1;
  const userId = 2;

  beforeAll(async () => {
    token = await adminLogin();
  });

  afterAll(async () => {
    token = undefined;

    await prisma.teamMember.deleteMany({
      where: {
        teamId: teamId,
        userId: userId,
      },
    });
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

  it('should add a member to the team', async () => {
    const response = await request(app)
      .post(`/teams/${teamId}/members`)
      .set('Authorization', `Bearer ${token}`)
      .send({ userID: userId });

    expect(response.status).toBe(201);
  });

  it('should return 404 if team does not exist', async () => {
    const response = await request(app)
      .post(`/teams/9999/members`)
      .set('Authorization', `Bearer ${token}`)
      .send({ userID: userId });

    expect(response.status).toBe(404);
    expect(response.body.message).toBe('Team not found');
  });

  it('should return 404 if user does not exist', async () => {
    const response = await request(app)
      .post(`/teams/${teamId}/members`)
      .set('Authorization', `Bearer ${token}`)
      .send({ userID: 9999 });

    expect(response.status).toBe(404);
    expect(response.body.message).toBe('User not found');
  });

  it('should return 409 if user is already a member of the team', async () => {
    const response = await request(app)
      .post(`/teams/${teamId}/members`)
      .set('Authorization', `Bearer ${token}`)
      .send({ userID: userId });

    expect(response.status).toBe(409);
    expect(response.body.message).toBe('User is already a member of this team');
  });

  it('should return 400 for invalid team ID', async () => {
    const response = await request(app)
      .post(`/teams/invalid/members`)
      .set('Authorization', `Bearer ${token}`)
      .send({ userID: userId });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Validation error');
  });

  it('should return 400 for invalid user ID', async () => {
    const response = await request(app)
      .post(`/teams/${teamId}/members`)
      .set('Authorization', `Bearer ${token}`)
      .send({ userID: 'invalid' });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Validation error');
  });
});
