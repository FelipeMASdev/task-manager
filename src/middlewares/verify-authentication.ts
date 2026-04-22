import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
//import { authConfig } from '@/configs/auth.js';
import { AppError } from '@/utils/AppError.js';
import { authConfig } from '@/configs/auth.js';

interface TokenPayload {
  role: string;
  sub: string;
}

function verifyAuthentication(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      throw new AppError('JWT token not found', 401);
    }

    const [, token] = authHeader.split(' ');

    if (!token) {
      throw new AppError('JWT token not found', 401);
    }

    const decodedToken = jwt.verify(token, authConfig.jwt.secret);
    const { role, sub } = decodedToken as TokenPayload;

    req.user = {
      id: parseInt(sub),
      role,
    };

    return next();
  } catch (_error) {
    throw new AppError('Invalid JWT token', 401);
  }
}

export { verifyAuthentication };
