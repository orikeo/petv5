import TelegramBot from 'node-telegram-bot-api';
import { Session } from '../sessions/session.types';

import { createWeight, getWeights } from '../api';
import { weightNavKeyboard } from '../keyboards/weight.keyboard';

export const handleWeightMessage = async (
  bot: TelegramBot,
  msg: TelegramBot.Message,
  session: Session
) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  if (text === '➕ Вес') {
    session.mode = 'weight';
    return bot.sendMessage(chatId, 'Введи вес');
  }

  const weight = Number(text);
  if (Number.isNaN(weight)) {
    return bot.sendMessage(chatId, 'Это не число');
  }

  await createWeight(
    session.token,
    new Date().toISOString().slice(0, 10),
    weight
  );

  session.mode = undefined;

  bot.sendMessage(chatId, '✅ Сохранено');
};