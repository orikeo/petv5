import { sessions } from '../sessions/session.store';
import { handleWeightMessage } from './weight.handler';
import { handleNotesMessage } from './notes.handler';
import TelegramBot from 'node-telegram-bot-api';

export const handleMessage = async ( 
  bot: TelegramBot,
  msg: TelegramBot.Message
) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  if (!text || text.startsWith('/')) return;

  const session = sessions.get(chatId);
  if (!session) return;

  if (text === '➕ Вес' || session.mode === 'weight') {
    return handleWeightMessage(bot, msg, session);
  }

  if (text === '📝 Заметка' || session.mode === 'note') {
    return handleNotesMessage(bot, msg, session);
  }
};