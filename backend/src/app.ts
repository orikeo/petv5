import express from "express";
import cookieParser from "cookie-parser";

import { notesRouter } from "./modules/notes/notes.router";
import { carRouter } from "./modules/car/car.router";
import { weightRouter } from "./modules/weight/weight.router";
import { authRouter } from "./modules/auth/auth.router";
import { fuelRouter } from "./modules/car/fuel/fuel.router";
import { repairRouter } from "./modules/car/repair/repair.router";
import { dailyCheckRouter } from "./modules/daily-check/daily-check.router";

import { errorMiddleware } from "./middlewares/error.middleware";

/**
 * =========================================================
 * EXPRESS APP
 * =========================================================
 *
 * Здесь мы только:
 *  - создаём express-приложение
 *  - подключаем middleware
 *  - подключаем роуты
 *  - подключаем общий error middleware
 *
 * ВАЖНО:
 * app.ts НЕ должен запускать сервер через app.listen().
 * Сервер должен запускаться только в main.ts.
 */
export const app = express();

/**
 * =========================================================
 * GLOBAL MIDDLEWARES
 * =========================================================
 */
app.use(express.json());
app.use(cookieParser());

/**
 * =========================================================
 * BASIC ROUTES
 * =========================================================
 */
app.get("/", (_req, res) => {
  res.send("Bot is running");
});

app.get("/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

/**
 * =========================================================
 * FEATURE ROUTES
 * =========================================================
 */
app.use("/auth", authRouter);
app.use("/notes", notesRouter);
app.use("/weights", weightRouter);
app.use("/cars", carRouter);
app.use("/fuel", fuelRouter);
app.use("/repair", repairRouter);
app.use("/daily-check", dailyCheckRouter);

/**
 * =========================================================
 * ERROR HANDLER
 * =========================================================
 *
 * Всегда подключаем последним.
 * Иначе Express не будет корректно пробрасывать ошибки сюда.
 */
app.use(errorMiddleware);