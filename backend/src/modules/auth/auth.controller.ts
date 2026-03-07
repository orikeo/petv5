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
  try {
    validateRegister(req.body);

    const user = await authService.register(req.body);

    res.status(201).json(user);

  } catch (err: any) {
    console.error('REGISTER ERROR:', err);

    res.status(err.status || 500).json({
      message: err.message || 'Registration failed'
    });
  }
};

export const login = async (
  req: Request<{}, {}, LoginDto>,
  res: Response
) => {
  try {

    const { accessToken, refreshToken } =
      await authService.login(req.body);

    // 🍪 Для web
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      sameSite: 'strict',
      secure: false // true в production при https
    });

    // 📱 Для mobile
    res.json({
      accessToken,
      refreshToken
    });

  } catch (err: any) {

    console.error('LOGIN ERROR:', err);

    res.status(err.status || 500).json({
      message: err.message || 'Login failed'
    });
  }
};

export const telegramAuth = async (
  req: Request<{}, {}, TelegramAuthDto>,
  res: Response
) => {
  try {

    if (!req.body.telegramId) {
      throw new AppError('telegramId required', 400);
    }

    const result = await authService.telegramLogin(req.body);

    res.json(result);

  } catch (err: any) {

    console.error('TELEGRAM AUTH ERROR:', err);

    res.status(err.status || 500).json({
      message: err.message || 'Telegram auth failed'
    });
  }
};

export const refresh = async (req: Request, res: Response) => {
  try {

    const token =
      req.cookies?.refreshToken ||
      req.body?.refreshToken;

    if (!token) {
      throw new AppError('No refresh token', 401);
    }

    const payload = verifyRefreshToken(token);

    const accessToken = generateAccessToken({
      userId: payload.userId,
      role: payload.role
    });

    res.json({ accessToken });

  } catch (err: any) {

    console.error('REFRESH TOKEN ERROR:', err);

    res.status(err.status || 401).json({
      message: err.message || 'Invalid refresh token'
    });
  }
};

export const getTelegramLinkCode = async (
  req: Request,
  res: Response
) => {
  try {

    if (!req.user) {
      throw new AppError('Unauthorized', 401);
    }

    const code = await authService.createTelegramLinkCode(
      req.user.id
    );

    res.json({ code });

  } catch (err: any) {

    console.error('GET TELEGRAM LINK CODE ERROR:', err);

    res.status(err.status || 500).json({
      message: err.message || 'Failed to generate code'
    });
  }
};

export const confirmTelegramLink = async (
  req: Request,
  res: Response
) => {
  try {

    const { code, telegramId } = req.body;

    await authService.linkTelegram(code, telegramId);

    res.json({ success: true });

  } catch (err: any) {

    console.error('CONFIRM TELEGRAM LINK ERROR:', err);

    res.status(400).json({
      message: err.message
    });
  }
};

export const logout = async (
  _req: Request,
  res: Response
) => {
  try {

    res.clearCookie('refreshToken', {
      httpOnly: true,
      sameSite: 'strict',
      secure: false
    });

    res.status(204).send();

  } catch (err: any) {

    console.error('LOGOUT ERROR:', err);

    res.status(500).json({
      message: 'Logout failed'
    });
  }
};

export const telegramLogin = async (
  req: Request,
  res: Response
) => {
  try {

    const { telegramId } = req.body;

    if (!telegramId) {
      return res.status(400).json({
        message: 'telegramId is required'
      });
    }

    const result =
      await authService.loginWithTelegram(telegramId);

    return res.json(result);

  } catch (err: any) {

    console.error('TELEGRAM LOGIN ERROR:', err);

    return res.status(err.status || 500).json({
      message: err.message || 'Telegram login failed'
    });
  }
};