import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/app-error';

export const errorMiddleware = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      message: err.message
    });
  }

  console.error(err);

  return res.status(500).json({
    message: 'Internal server error'
  });
};