import request from 'supertest';
import { app } from '../../app.js';
import { describe, it, expect } from '@jest/globals';
import 'dotenv/config';
import { adminLogin } from '../admin-login.js';

describe('GET /teams', () => {
  let token: string | undefined;

  beforeAll(async () => {
    token = await adminLogin();
  });

  afterAll(async () => {
    token = undefined;
  });

  it('should list all teams', async () => {
    const response = await ListTeams(token);

    expect(response.status).toBe(200);
    expect(token).toBeDefined();
    expect(response.body).toHaveProperty('message');
    expect(response.body).toHaveProperty('teams');
    expect(Array.isArray(response.body.teams)).toBe(true);
  });
});

async function ListTeams(token: string | undefined) {
  const response = await request(app).get('/teams').set('Authorization', `Bearer ${token}`);
  return response;
}
