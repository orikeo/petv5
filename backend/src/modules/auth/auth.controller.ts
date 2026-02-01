import { Request, Response } from 'express';
import { RegisterDto } from './auth.types';
import { authService } from './auth.service';
import { validateRegister } from './auth.validator';

export const register = async (
  req: Request<{}, {}, RegisterDto>,
  res: Response
) => {
  validateRegister(req.body);

  const user = await authService.register(req.body);
  res.status(201).json(user);
};