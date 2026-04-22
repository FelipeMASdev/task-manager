import 'dotenv/config';
import type { SignOptions } from 'jsonwebtoken';
import { env } from '@/env.js';

export const authConfig = {
  jwt: {
    secret: env.JWT_SECRET,
    expiresIn: '1d' as Exclude<SignOptions['expiresIn'], undefined>,
  },
};
