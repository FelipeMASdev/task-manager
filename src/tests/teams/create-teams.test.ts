import request from 'supertest';
import { app } from '../../app.js';
import { describe, it, expect } from '@jest/globals';
import { prisma } from '@/prisma.js';
import 'dotenv/config';
import { adminLogin } from '../admin-login.js';

describe('POST /teams', () => {
  let teamId: number | undefined;
  let token: string | undefined;

  beforeAll(async () => {
    token = await adminLogin();
  });

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

  it('should create a new team', async () => {
    const response = await createNewTeam(token, 'test team', 'Team creation test');
    const team = response.body.team;
    teamId = team.id;

    expect(response.status).toBe(201);
    expect(token).toBeDefined();
    expect(team).toHaveProperty('id');
    expect(team).toHaveProperty('name');
    expect(team.name).toBe('test team');
  });

  it('should return 400 Bad Request for invalid input', async () => {
    const response = await createNewTeam(token, 't', 'short');

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('message');
    expect(response.body.message).toContain('Validation error');
  });

  it('should return 409 Conflict for team with duplicate name', async () => {
    const response = await createNewTeam(token, 'test team', 'Team creation test');

    expect(response.status).toBe(409);
    expect(response.body).toHaveProperty('message');
    expect(response.body.message).toContain('Team with this name already exists');
  });
});

export async function createNewTeam(token: string | undefined, name: string, description: string) {
  const newTeam: NewTeam = {
    name: name,
    description: description,
  };

  const response = await request(app)
    .post('/teams')
    .set('Authorization', `Bearer ${token}`)
    .send(newTeam);

  return response;
}
