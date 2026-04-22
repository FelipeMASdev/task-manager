import type { Request, Response, NextFunction } from 'express';
import { AppError } from '@/utils/AppError.js';
import { ZodError } from 'zod';
import { z } from 'zod';

export function errorHandling(
  error: Error | AppError | ZodError,
  req: Request,
  res: Response,
  _next: NextFunction,
) {
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      message: error.message,
    });
  }

  if (error instanceof ZodError) {
    return res.status(400).json({
      message: 'Validation error',
      errors: z.treeifyError(error),
    });
  }

  return res.status(500).json({
    message: error.message || 'Internal Server Error',
  });
}
