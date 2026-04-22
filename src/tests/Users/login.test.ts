import request from 'supertest';
import { app } from '../../app.js';
import { describe, it, expect } from '@jest/globals';
import { prisma } from '@/prisma.js';

const USER_NAME = 'John Dove';
const USER_EMAIL = 'john.dove@test.com';
const USER_PASSWORD = 'test1234';

describe('POST /users/login', () => {
  let userId: number | undefined;

  beforeAll(async () => {
    const user = await createUser();
    userId = user.id;
  });

  afterAll(async () => {
    if (!userId) {
      return;
    }

    await prisma.user.delete({
      where: { id: userId },
    });
    userId = undefined;
  });

  it('should generate a token for a user with valid credentials', async () => {
    const loginInfo = {
      email: USER_EMAIL,
      password: USER_PASSWORD,
    };

    const response = await request(app).post('/users/login').send(loginInfo);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('token');
    expect(typeof response.body.token).toBe('string');

    expect(response.body).toHaveProperty('user');
    expect(response.body.user).toHaveProperty('email');
    expect(response.body.user).not.toHaveProperty('password');
  });

  it('should return an error for a user with invalid credentials', async () => {
    const loginInfo = {
      email: USER_EMAIL,
      password: 'wrongpassword',
    };

    const response = await request(app).post('/users/login').send(loginInfo);

    expect(response.status).toBe(401);
    expect(response.body.message).toBe('Invalid email or password');
  });
});

async function createUser() {
  const newUser: NewUser = {
    name: USER_NAME,
    email: USER_EMAIL,
    password: USER_PASSWORD,
  };
  const response = await request(app).post('/users').send(newUser);

  const user = { ...response.body.user };

  return user;
}
