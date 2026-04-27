import request from 'supertest';
import { app } from '../../app.js';
import { describe, it, expect } from '@jest/globals';
import 'dotenv/config';
import { adminLogin } from '../admin-login.js';
import { createNewTeam } from './create-teams.test.js';

describe('DELETE /teams', () => {
  let token: string | undefined;
  let id: number | undefined;

  beforeAll(async () => {
    token = await adminLogin();
    const response = await createNewTeam(
      token,
      'Team Delete Test',
      'This team should be deleted in tests',
    );
    id = response.body.team.id;
  });

  afterAll(async () => {
    token = undefined;
    id = undefined;
  });

  it('should delete the previouly created team', async () => {
    const response = await deleteTeam(token, id);

    expect(response.status).toBe(200);
    expect(token).toBeDefined();
    expect(response.body.message).toBe(`Team Team Delete Test with ID ${id} deleted successfully`);
  });

  it('should return 404 if team does not exist', async () => {
    const response = await deleteTeam(token, 9999);

    expect(response.status).toBe(404);
    expect(token).toBeDefined();
    expect(response.body.message).toBe('Team not found');
  });

  it('should return 400 if team ID is invalid', async () => {
    const response = await deleteTeam(
      token,
      // @ts-expect-error intentional invalid type for validation scenario
      '1qwerty',
    );

    expect(response.status).toBe(400);
    expect(token).toBeDefined();
    expect(response.body.message).toBe('Validation error');
  });
});

async function deleteTeam(token: string | undefined, id: number | undefined) {
  const response = await request(app)
    .delete(`/teams/${id}`)
    .set('Authorization', `Bearer ${token}`);
  return response;
}
