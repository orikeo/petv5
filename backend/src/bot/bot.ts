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

bot.onText(/\/start/, async (msg) => {
  try {
    await handleStart(bot, msg);
  } catch (error: any) {
    console.error('START ERROR:', error.response?.data || error.message);

    await bot.sendMessage(
      msg.chat.id,
      '❌ Ошибка при старте'
    );
  }
});

bot.onText(/\/link (.+)/, async (msg, match) => {
  try {
    const code = match?.[1];
    const telegramId = String(msg.from?.id);

    const response = await axios.post(
      `${BASE_URL}/auth/telegram/link`,
      { code, telegramId }
    );

    

    await bot.sendMessage(
      msg.chat.id,
      '✅ Telegram привязан'
    );

  } catch (error: any) {
    console.error('LINK ERROR:', error.response?.data || error.message);

    await bot.sendMessage(
      msg.chat.id,
      '❌ Ошибка привязки'
    );
  }
});

bot.on('message', async (msg) => {
  if (msg.text?.startsWith('/')) return; // игнорируем команды

  await handleMessage(bot, msg);
});

bot.on('callback_query', (query) =>
  handleCallback(bot, query)
);

console.log('🤖 Telegram bot started');