import "dotenv/config";
import "./types/express";

import { app } from "./app";

/**
 * =========================================================
 * SERVER BOOTSTRAP
 * =========================================================
 *
 * Это единственное место, где сервер действительно запускается.
 * Так проще поддерживать проект:
 *  - app.ts собирает приложение
 *  - main.ts запускает его
 */
const PORT = Number(process.env.PORT) || 3000;

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
  console.log("NODE NOW:", new Date().toISOString());
});