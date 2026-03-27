import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../modules/auth/jwt";
import { AppError } from "../errors/app-error";

/**
 * =========================================================
 * AUTH GUARD
 * =========================================================
 *
 * Что делает:
 * 1. Проверяет наличие Authorization header
 * 2. Достаёт Bearer token
 * 3. Валидирует access token
 * 4. Кладёт пользователя в req.user
 *
 * Важно:
 * - если токен битый / истёк / невалидный,
 *   мы всегда отдаём 401, а не 500
 */
export const authGuard = (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      return next(new AppError("Unauthorized", 401));
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return next(new AppError("Unauthorized", 401));
    }

    const payload = verifyAccessToken(token);

    req.user = {
      id: payload.userId,
      role: payload.role,
    };

    return next();
  } catch (_error) {
    /**
     * Нам здесь не нужно светить детали JWT-ошибок наружу.
     * Для клиента достаточно одного понятного ответа:
     * Unauthorized (401)
     */
    return next(new AppError("Unauthorized", 401));
  }
};