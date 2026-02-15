import TelegramBot from 'node-telegram-bot-api';

import { telegramLogin} from '../api';
import { sessions } from '../sessions/session.store';
import { mainKeyboard } from '../keyboards/main.keyboard';

export const handleStart = async (
  bot: TelegramBot,
  msg: TelegramBot.Message
) => {
  const chatId = msg.chat.id;
  const telegramId = String(msg.from?.id);

  const { accessToken } =
    await telegramLogin(telegramId);

  sessions.set(telegramId, {
    token: accessToken
  });

  bot.sendMessage(
    chatId,
    'Привет 👋 Что хочешь сделать?',
    mainKeyboard
  );
};