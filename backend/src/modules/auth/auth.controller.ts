import { Request, Response } from 'express';
import { RegisterDto, LoginDto, TelegramAuthDto } from './auth.types';
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

export const telegramAuth = async (
  req: Request<{}, {}, TelegramAuthDto>,
  res: Response
) => {
  if (!req.body.telegramId) {
    throw new AppError('telegramId required', 400);
  }

  const result = await authService.telegramLogin(req.body);
  res.json(result);
};

export const refresh = async (req: Request, res: Response) => {
  const token = req.cookies?.refreshToken;

  if (!token) {
    throw new AppError('No refresh token', 401);
  }

  const payload = verifyRefreshToken(token);

const accessToken = generateAccessToken({
  userId: payload.userId,
  role: payload.role
});

  res.json({ accessToken });
};

export const getTelegramLinkCode = async (
  req: Request<{}, {}, {}, {}>,
  res: Response
) => {
  if (!req.user) {
    throw new Error('Unauthorized');
  }

  const code = await authService.createTelegramLinkCode(
    req.user.id
  );

  res.json({ code });
};

export const confirmTelegramLink = async (
  req: Request,
  res: Response
) => {
  const { code, telegramId } = req.body;

  try {
    await authService.linkTelegram(
      code,
      telegramId
    );

    res.json({ success: true });
  } catch (e: any) {
    res.status(400).json({
      message: e.message
    });
  }
};

export const logout = async (_req: Request, res: Response) => {
  res.clearCookie('refreshToken', {
    httpOnly: true,
    sameSite: 'strict',
    secure: false
  });

  res.status(204).send();
};

export const telegramLogin = async (
  req: Request,
  res: Response
) => {
  const { telegramId } = req.body;

  if (!telegramId) {
    return res.status(400).json({
      message: 'telegramId is required'
    });
  }

  try {
    const result =
      await authService.loginWithTelegram(
        telegramId
      );

    return res.json(result);

  } catch (e: any) {
    return res.status(400).json({
      message: e.message || 'Login failed'
    });
  }
};