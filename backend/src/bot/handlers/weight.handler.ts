import TelegramBot from 'node-telegram-bot-api';
import { Session } from '../sessions/session.types';

import { confirmKeyboard } from '../keyboards/confirm.keyboard';

export const handleWeightMessage = async (
  bot: TelegramBot,
  msg: TelegramBot.Message,
  session: Session
) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  if (text === '➕ Вес') {
    session.mode = 'weight';
    return bot.sendMessage(
      chatId,
      'Введи вес'
    );
  }

  const weight = Number(text);

  if (Number.isNaN(weight)) {
    return bot.sendMessage(
      chatId,
      'Это не число'
    );
  }

  // ✅ только кладём в сессию
  session.pendingWeight = weight;
  session.mode = undefined;

  return bot.sendMessage(
    chatId,
    `Вес: ${weight} кг\nСохранить?`,
    confirmKeyboard('weight')
  );
};
