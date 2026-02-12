import { Router } from 'express';
import { authGuard } from '../../middlewares/auth.middleware';
import { register, login, refresh, logout, telegramAuth, getTelegramLinkCode,
  confirmTelegramLink, telegramLogin  } from './auth.controller';

export const authRouter = Router();

authRouter.post('/register', register);
authRouter.post('/login', login);
authRouter.post('/refresh', refresh);
authRouter.post('/logout', logout);
authRouter.post('/telegram', telegramAuth);
authRouter.post(
  '/telegram/link-code',
  authGuard,
  getTelegramLinkCode
);
authRouter.post(
  '/telegram/confirm',
  confirmTelegramLink
);
authRouter.post(
  '/telegram/login',
  telegramLogin
);