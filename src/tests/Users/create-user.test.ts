import request from 'supertest';
import { app } from '../../app.js';
import { describe, it, expect } from '@jest/globals';
import { prisma } from '@/prisma.js';

describe('POST /users', () => {
  let userId: number | undefined;

  afterAll(async () => {
    if (!userId) {
      return;
    }

    await prisma.user.delete({
      where: { id: userId },
    });
    userId = undefined;
  });

  it('should create a new user', async () => {
    const newUser: NewUser = {
      name: 'John Doe',
      email: 'john.doe@test.com',
      password: 'test1234',
    };

    const response = await request(app).post('/users').send(newUser);

    expect(response.status).toBe(201);
    expect(response.body.user).toHaveProperty('id');
    expect(response.body.user.name).toBe(newUser.name);
    expect(response.body.user.email).toBe(newUser.email);
    expect(response.body.user).not.toHaveProperty('password');

    userId = response.body.user.id;
  });

  it('should return status 400 if email is already in use', async () => {
    const newUser: NewUser = {
      name: 'John Doe',
      email: 'john.doe@test.com',
      password: 'test1234',
    };

    const response = await request(app).post('/users').send(newUser);

    expect(response.status).toBe(409);
  });

  it('should return status 400 if required fields are missing', async () => {
    const response = await request(app).post('/users').send({
      email: 'jane.doe@test.com',
      password: 'test1234',
    });

    expect(response.status).toBe(400);
  });
});
