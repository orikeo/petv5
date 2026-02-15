import TelegramBot from 'node-telegram-bot-api';
import { sessions } from '../sessions/session.store';
import { createWeight, createNote } from '../api';

export const handleCallback = async (
  bot: TelegramBot,
  query: TelegramBot.CallbackQuery
) => {
 const chatId = query.message?.chat.id;
if (!chatId) return;

const telegramId = String(query.from?.id);
if (!telegramId) return;

const session = sessions.get(telegramId);
  if (!session) return;

  const data = query.data || '';

  if (data === 'CONFIRM:weight' && session.pendingWeight) {
    await createWeight(
      session.token,
      new Date().toISOString().slice(0, 10),
      session.pendingWeight
    );

    session.pendingWeight = undefined;

    bot.sendMessage(chatId, '✅ Вес сохранён');
  }

  if (data === 'CONFIRM:note' && session.pendingNote) {
    const title = `Telegram ${new Date().toLocaleDateString()}`;

    await createNote(
      session.token,
      title,
      session.pendingNote
    );

    session.pendingNote = undefined;

    bot.sendMessage(chatId, '📝 Заметка сохранена');
  }

  if (data.startsWith('CANCEL')) {
    session.pendingWeight = undefined;
    session.pendingNote = undefined;

    bot.sendMessage(chatId, '❌ Отменено');
  }
};