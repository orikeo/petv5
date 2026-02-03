import 'dotenv/config';

import TelegramBot from 'node-telegram-bot-api';
import { telegramAuth, createWeight, createNote } from './api';
import { mainKeyboard } from './commands';



const token = process.env.TG_BOT_TOKEN!;
const bot = new TelegramBot(token, { polling: true });

// Простое in-memory состояние (для старта)
const sessions = new Map<number, { token: string; mode?: 'weight' | 'note' }>();

bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  const telegramId = String(msg.from?.id);

  const accessToken = await telegramAuth(telegramId);

  sessions.set(chatId, { token: accessToken });

  bot.sendMessage(
    chatId,
    'Привет 👋 Что хочешь сделать?',
    mainKeyboard
  );
});

// Обработка кнопок / текста
bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  if (!text || text.startsWith('/')) return;

  const session = sessions.get(chatId);
  if (!session) return;

  if (text === '➕ Вес') {
    session.mode = 'weight';
    bot.sendMessage(chatId, 'Введи вес (например: 82.4)');
    return;
  }

  if (text === '📝 Заметка') {
    session.mode = 'note';
    bot.sendMessage(chatId, 'Введи текст заметки');
    return;
  }

  // ---- ввод веса ----
  if (session.mode === 'weight') {
    const weight = Number(text);

    if (Number.isNaN(weight)) {
      bot.sendMessage(chatId, 'Это не число 😅');
      return;
    }

    await createWeight(
      session.token,
      new Date().toISOString().slice(0, 10),
      weight
    );

    session.mode = undefined;
    bot.sendMessage(chatId, '✅ Вес сохранён', mainKeyboard);
    return;
  }

  // ---- ввод заметки ----
  if (session.mode === 'note') {
    await createNote(
      session.token,
      text.slice(0, 50),
      text
    );

    session.mode = undefined;
    bot.sendMessage(chatId, '📝 Заметка сохранена', mainKeyboard);
  }
});

console.log('🤖 Telegram bot started');