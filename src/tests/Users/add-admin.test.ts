import request from 'supertest';
import { app } from '../../app.js';
import { describe, it, expect } from '@jest/globals';
import { prisma } from '@/prisma.js';
import { adminLogin } from '../admin-login.js';
import { memberLogin } from '../member-login.js';

describe('PATCH /users/:id/add-admin', () => {
  const userId = 5;

  let adminToken: string | undefined;
  let memberToken: string | undefined;

  beforeAll(async () => {
    adminToken = await adminLogin();
    memberToken = await memberLogin();
  });

  afterAll(async () => {
    adminToken = undefined;
    memberToken = undefined;

    await resetUserRole(userId);
  });

  it('should promote a user to admin when logged in as admin', async () => {
    const response = await request(app)
      .patch(`/users/${userId}/add-admin`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
    expect(adminToken).toBeDefined();
    expect(response.body.message).toBe('User promoted to admin successfully');
    expect(response.body).toHaveProperty('newAdmin');
    expect(response.body.newAdmin.role).toBe('admin');
  });

  it('should return 400 if the user is already an admin', async () => {
    const response = await request(app)
      .patch(`/users/${userId}/add-admin`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('User is already an admin');
  });

  it('should return 403 when trying to promote a user to admin while logged in as a member', async () => {
    await resetUserRole(userId);

    const response = await request(app)
      .patch(`/users/${userId}/add-admin`)
      .set('Authorization', `Bearer ${memberToken}`);

    expect(response.status).toBe(403);
    expect(memberToken).toBeDefined();
  });

  it('should return 404 if the user does not exist', async () => {
    const response = await request(app)
      .patch('/users/9999/add-admin')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(404);
    expect(response.body.message).toBe('User not found');
  });

  it('should return 401 if no token is provided', async () => {
    const response = await request(app).patch(`/users/${userId}/add-admin`);

    expect(response.status).toBe(401);
  });
});

async function resetUserRole(userId: number) {
  return await prisma.user.update({
    where: { id: userId },
    data: { role: 'member' },
  });
}
