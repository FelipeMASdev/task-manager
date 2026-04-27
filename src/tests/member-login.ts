import request from 'supertest';
import { app } from '../app.js';
import 'dotenv/config';

export async function memberLogin() {
  const loginInfo = {
    email: process.env.MEMBER_USER,
    password: process.env.MEMBER_PASSWORD,
  };

  const data = await request(app).post('/users/login').send(loginInfo);
  const token = data.body.token;

  return token;
}
