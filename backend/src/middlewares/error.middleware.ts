import { Request, Response, NextFunction } from "express";
import { JsonWebTokenError, TokenExpiredError } from "jsonwebtoken";
import { AppError } from "../errors/app-error";

/**
 * =========================================================
 * GLOBAL ERROR MIDDLEWARE
 * =========================================================
 *
 * Порядок обработки:
 * 1. наши бизнес-ошибки (AppError)
 * 2. JWT-ошибки
 * 3. всё остальное = 500
 */
export const errorMiddleware = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  /**
   * Наши управляемые ошибки
   */
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      message: err.message,
    });
  }

  /**
   * Ошибки JWT:
   * - access token expired
   * - invalid signature
   * - malformed token
   *
   * Для клиента это обычный Unauthorized
   */
  if (err instanceof TokenExpiredError || err instanceof JsonWebTokenError) {
    return res.status(401).json({
      message: "Unauthorized",
    });
  }

  /**
   * Всё неизвестное логируем и отдаём 500
   */
  console.error("UNHANDLED ERROR:", err);

  return res.status(500).json({
    message: "Internal server error",
  });
};