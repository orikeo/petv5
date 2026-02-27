import 'dotenv/config';
import TelegramBot from 'node-telegram-bot-api';
import axios from 'axios';

import { handleStart } from './handlers/start.handler';
import { handleMessage } from './handlers/message.handler';
import { handleCallback } from './handlers/callback.handler';

const BASE_URL = process.env.BASE_URL!

 const bot = new TelegramBot(
  process.env.TG_BOT_TOKEN!,
  { polling: true }
);

bot.onText(/\/start/, (msg) =>
  handleStart(bot, msg)
);

bot.onText(/\/link (.+)/, async (msg, match) => {
  const code = match?.[1];
  const telegramId = String(msg.from?.id);

  await axios.post(
    `${BASE_URL}/auth/telegram/link`,
    { code, telegramId }
  );

  bot.sendMessage(
    msg.chat.id,
    '✅ Telegram привязан'
  );
});

bot.on('message', (msg) =>
  handleMessage(bot, msg)
);

bot.on('callback_query', (query) =>
  handleCallback(bot, query)
);

console.log('🤖 Telegram bot started');