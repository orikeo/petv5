import { Router } from "express";
import { authGuard } from "../../middlewares/auth.middleware";
import {
  register,
  login,
  refresh,
  logout,
  telegramAuth,
  getTelegramLinkCode,
  confirmTelegramLink,
} from "./auth.controller";

export const authRouter = Router();

/**
 * =========================================================
 * EMAIL AUTH
 * =========================================================
 */

authRouter.post("/register", register);
authRouter.post("/login", login);
authRouter.post("/refresh", refresh);
authRouter.post("/logout", logout);

/**
 * =========================================================
 * TELEGRAM AUTH
 * =========================================================
 *
 * Оставляем только одну точку:
 * POST /auth/telegram
 */
authRouter.post("/telegram", telegramAuth);

/**
 * =========================================================
 * TELEGRAM LINKING
 * =========================================================
 */

authRouter.post(
  "/telegram/link-code",
  authGuard,
  getTelegramLinkCode
);

authRouter.post(
  "/telegram/confirm",
  confirmTelegramLink
);