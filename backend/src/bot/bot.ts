import 'dotenv/config';
import TelegramBot from 'node-telegram-bot-api';

import { handleStart } from './handlers/start.handler';
import { handleMessage } from './handlers/message.handler';

const bot = new TelegramBot(
  process.env.TG_BOT_TOKEN!,
  { polling: true }
);

bot.onText(/\/start/, (msg) =>
  handleStart(bot, msg)
);

bot.on('message', (msg) =>
  handleMessage(bot, msg)
);

console.log('🤖 Telegram bot started');