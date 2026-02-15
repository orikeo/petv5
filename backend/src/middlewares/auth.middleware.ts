import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../modules/auth/jwt';
import { AppError } from '../errors/app-error';

export const authGuard = (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    throw new AppError('Unauthorized', 401);
  }

  const token = authHeader.split(' ')[1];
  const payload = verifyAccessToken(token);
  console.log('JWT PAYLOAD:', payload);

  req.user = {
    id: payload.userId,
    role: payload.role
  };

  next();
};