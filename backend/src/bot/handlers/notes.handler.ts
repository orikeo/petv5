import TelegramBot from 'node-telegram-bot-api';
import { Session } from '../sessions/session.types';

import { createNote, getNotes, getNoteById } from '../api';
import { noteItemButton } from '../keyboards/notes.keyboard';

export const handleNotesMessage = async (
  bot: TelegramBot,
  msg: TelegramBot.Message,
  session: Session
) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  if (text === '📝 Заметка') {
    session.mode = 'note';
    return bot.sendMessage(chatId, 'Введи текст');
  }

  const title = `Telegram ${new Date().toLocaleDateString()}`;

  await createNote(session.token, title, text);

  session.mode = undefined;

  bot.sendMessage(chatId, '📝 Заметка сохранена');
};