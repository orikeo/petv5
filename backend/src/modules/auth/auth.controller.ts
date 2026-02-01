import { Request, Response } from 'express';
import { RegisterDto, LoginDto } from './auth.types';
import { authService } from './auth.service';
import { validateRegister } from './auth.validator';
import { AppError } from '../../errors/app-error';
import { verifyRefreshToken, generateAccessToken } from './jwt';

export const register = async (
  req: Request<{}, {}, RegisterDto>,
  res: Response
) => {
  validateRegister(req.body);

  const user = await authService.register(req.body);
  res.status(201).json(user);
};

export const login = async (
  req: Request<{}, {}, LoginDto>,
  res: Response
) => {
  const { accessToken, refreshToken } =
    await authService.login(req.body);

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    sameSite: 'strict',
    secure: false // потом true для https
  });

  res.json({ accessToken });
};

export const refresh = async (req: Request, res: Response) => {
  const token = req.cookies?.refreshToken;

  if (!token) {
    throw new AppError('No refresh token', 401);
  }

  const payload = verifyRefreshToken(token);

  const accessToken = generateAccessToken({
    userId: payload.userId
  });

  res.json({ accessToken });
};

export const logout = async (_req: Request, res: Response) => {
  res.clearCookie('refreshToken', {
    httpOnly: true,
    sameSite: 'strict',
    secure: false
  });

  res.status(204).send();
};