import request from 'supertest';
import { app } from '../../app.js';
import { describe, it, expect } from '@jest/globals';
import 'dotenv/config';
import { adminLogin } from '../admin-login.js';

describe('PATCH /teams', () => {
  let token: string | undefined;

  beforeAll(async () => {
    token = await adminLogin();
  });

  afterAll(async () => {
    await updateTeam(token, { id: 1, name: 'Produto', description: 'Time de Produto' });
    token = undefined;
  });

  it('should update a team name', async () => {
    const response = await updateTeam(token, { id: 1, name: 'Updated Team' });

    expect(response.status).toBe(200);
    expect(token).toBeDefined();
    expect(response.body.message).toBe('Team updated successfully');
    expect(response.body).toHaveProperty('updatedTeam');
    expect(response.body.updatedTeam.name).toBe('Updated Team');
  });

  it('should update a team description', async () => {
    const response = await updateTeam(token, { id: 1, description: 'Updated team description' });

    expect(response.status).toBe(200);
    expect(token).toBeDefined();
    expect(response.body.message).toBe('Team updated successfully');
    expect(response.body).toHaveProperty('updatedTeam');
    expect(response.body.updatedTeam.description).toBe('Updated team description');
  });

  it('should return 404 if team does not exist', async () => {
    const response = await updateTeam(token, { id: 999, name: 'Non-existent Team' });

    expect(response.status).toBe(404);
    expect(token).toBeDefined();
    expect(response.body.message).toBe('Team not found');
  });

  it('should return 400 if no fields are provided for update', async () => {
    const response = await updateTeam(token, { id: 1 });

    expect(response.status).toBe(400);
    expect(token).toBeDefined();
    expect(response.body.message).toBe(
      'At least one between name or description must be provided for update',
    );
  });

  it('should return 400 if team ID is invalid', async () => {
    const response = await updateTeam(token, {
      // @ts-expect-error intentional invalid type for validation scenario
      id: '1qwerty',
      name: 'Invalid ID Update',
    });

    expect(response.status).toBe(400);
    expect(token).toBeDefined();
    expect(response.body.message).toBe('Validation error');
  });

  it('should return 400 if team description is too short', async () => {
    const response = await updateTeam(token, { id: 1, description: 'Short' });

    expect(response.status).toBe(400);
    expect(token).toBeDefined();
    expect(response.body.message).toBe('Validation error');
  });
});

async function updateTeam(
  token: string | undefined,
  { id, name, description }: { id: number; name?: string; description?: string },
) {
  const response = await request(app)
    .patch(`/teams/${id}`)
    .set('Authorization', `Bearer ${token}`)
    .send({ name, description });
  return response;
}
