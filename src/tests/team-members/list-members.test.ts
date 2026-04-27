import request from 'supertest';
import { app } from '../../app.js';
import { describe, it, expect } from '@jest/globals';
//import { prisma } from '@/prisma.js';
import 'dotenv/config';
import { adminLogin } from '../admin-login.js';
import { memberLogin } from '../member-login.js';

describe('GET /teams/:teamID/members', () => {
  const adminTeamId = 1; // Ensure this team exists in the database and member is not part of it
  const memberTeamId = 2; // Ensure this team exists in the database and the member is part of it

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

  it('should list members of a team', async () => {
    const response = await request(app)
      .get(`/teams/${adminTeamId}/members`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
    expect(response.body.team.Team_Name).toBeDefined();
    expect(Array.isArray(response.body.team.members)).toBe(true);
  });

  it('should return 404 if team does not exist', async () => {
    const response = await request(app)
      .get('/teams/9999/members')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(404);
    expect(response.body.message).toBe('Team not found');
  });

  it('should return 400 if team ID is invalid', async () => {
    const response = await request(app)
      .get('/teams/1qwerty/members')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Validation error');
  });

  it('should return 200 when a member of the team requests the list of members', async () => {
    const response = await request(app)
      .get(`/teams/${memberTeamId}/members`)
      .set('Authorization', `Bearer ${memberToken}`);

    expect(response.status).toBe(200);
    expect(response.body.team.Team_Name).toBeDefined();
    expect(Array.isArray(response.body.team.members)).toBe(true);
  });

  it('should return 403 when a user who is not a member of the team requests the list of members', async () => {
    const response = await request(app)
      .get(`/teams/${adminTeamId}/members`)
      .set('Authorization', `Bearer ${memberToken}`);

    expect(response.status).toBe(403);
    expect(response.body.message).toBe('Only team members and admins can view team members');
    expect(response.body.team).toBeUndefined();
  });
});
