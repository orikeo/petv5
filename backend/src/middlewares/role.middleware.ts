import { Request, Response, NextFunction } from 'express';
import { UserRole } from '../modules/auth/auth.roles';
import { AppError } from '../errors/app-error';

export const requireRole =
  (...roles: UserRole[]) =>
  (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new AppError('Unauthorized', 401);
    }

    if (!roles.includes(req.user.role)) {
      throw new AppError('Forbidden', 403);
    }

    next();
  };