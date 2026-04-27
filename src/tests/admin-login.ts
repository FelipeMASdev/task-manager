import request from 'supertest';
import { app } from '../app.js';
import 'dotenv/config';

export async function adminLogin() {
  const loginInfo = {
    email: process.env.ADMIN_USER,
    password: process.env.ADMIN_PASSWORD,
  };

  const data = await request(app).post('/users/login').send(loginInfo);
  const token = data.body.token;

  return token;
}
