import type { Request, Response, NextFunction } from 'express';
import { AppError } from '@/utils/AppError.js';

function verifyAuthorization(allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new AppError('User not authenticated', 401);
    }

    if (!allowedRoles.includes(req.user.role)) {
      throw new AppError('User not authorized', 403);
    }

    return next();
  };
}

export { verifyAuthorization };
