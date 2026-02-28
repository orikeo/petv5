import { app } from './app';
import './types/express';
import 'dotenv/config';

import { bot } from "./botgrammy/bot";


const BASE_URL = process.env.BASE_URL!


const PORT = Number(process.env.PORT) || 3000;

app.post("/webhook", async (req, res) => {
  if (
    req.headers["x-telegram-bot-api-secret-token"] !==
    process.env.WEBHOOK_SECRET
  ) {
    return res.sendStatus(403);
  }

  await bot.handleUpdate(req.body);

  res.sendStatus(200);
});



/* Test */

app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);

  if (process.env.BASE_URL?.startsWith("https")) {
  await bot.api.setWebhook(`${BASE_URL}/webhook`, {
    secret_token: process.env.WEBHOOK_SECRET,
  });

  console.log("Webhook registered");
} else {
  console.log("Skipping webhook registration (not HTTPS)");
}

  console.log("Webhook registered");
});