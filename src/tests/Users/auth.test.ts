import request from 'supertest';
import { app } from '../../app.js';
import { describe, it, expect } from '@jest/globals';
import { prisma } from '@/prisma.js';
import 'dotenv/config';

let token: string | undefined;

describe('POST /teams without a valid token', () => {
  it('should return 401 Unauthorized', async () => {
    const response = await createNewTeam('invalid token');

    expect(response.status).toBe(401);
    expect(response.body.message).toBe('Invalid JWT token');
  });
});

describe('POST /teams as a regular user', () => {
  afterAll(async () => {
    token = undefined;
  });

  it('should return 403 Forbidden', async () => {
    token = await memberLogin();
    const response = await createNewTeam(token);

    console.log('Response status:', response.status);
    console.log('Response body:', response.body);

    expect(response.status).toBe(403);
    expect(response.body.message).toBe('User not authorized');
  });
});

describe('POST /teams as a admin user', () => {
  let teamId: number | undefined;

  afterAll(async () => {
    if (!teamId) {
      return;
    }

    await prisma.team.delete({
      where: { id: teamId },
    });
    teamId = undefined;
    token = undefined;
  });

  it('should create a new team (authorized)', async () => {
    token = await adminLogin();
    const response = await createNewTeam(token);
    const team = response.body.team;
    teamId = team.id;

    expect(response.status).toBe(201);
    expect(token).toBeDefined();
    expect(team).toHaveProperty('id');
    expect(team).toHaveProperty('name');
    expect(team.name).toBe('test team');
  });
});

async function memberLogin() {
  const loginInfo = {
    email: process.env.MEMBER_USER,
    password: process.env.MEMBER_PASSWORD,
  };

  const data = await request(app).post('/users/login').send(loginInfo);
  const token = data.body.token;

  return token;
}

async function adminLogin() {
  const loginInfo = {
    email: process.env.ADMIN_USER,
    password: process.env.ADMIN_PASSWORD,
  };

  const data = await request(app).post('/users/login').send(loginInfo);
  const token = data.body.token;

  return token;
}

async function createNewTeam(token: string | undefined) {
  const newTeam: NewTeam = {
    name: 'test team',
    description: 'Team for testing purposes',
  };

  const response = await request(app)
    .post('/teams')
    .set('Authorization', `Bearer ${token}`)
    .send(newTeam);

  return response;
}
