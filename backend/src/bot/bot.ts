import 'dotenv/config';
import TelegramBot from 'node-telegram-bot-api';

import {
  telegramAuth,
  createWeight,
  createNote,
  getWeights
} from './api';

import {
  mainKeyboard,
  weightNavKeyboard
} from './commands';

// --------------------

const token = process.env.TG_BOT_TOKEN!;
const bot = new TelegramBot(token, { polling: true });

// --------------------

type Session = {
  token: string;
  mode?: 'weight' | 'note';
  weightPage?: number;
};

const sessions = new Map<number, Session>();

// --------------------

const formatWeights = (
  items: { entryDate: string; weight: string }[]
) => {
  if (items.length === 0) {
    return 'Записей пока нет';
  }

  return (
    '⚖️ Вес:\n\n' +
    items
      .map((w) => `${w.entryDate} — ${w.weight} кг`)
      .join('\n')
  );
};

// --------------------
// /start
// --------------------

bot.onText(/\/start/, async (msg) => {
  try {
    const chatId = msg.chat.id;
    const telegramId = String(msg.from?.id);

    const accessToken = await telegramAuth(telegramId);

    sessions.set(chatId, { token: accessToken });

    bot.sendMessage(
      chatId,
      'Привет 👋 Что хочешь сделать?',
      mainKeyboard
    );
  } catch (err) {
    console.error(err);
  }
});

// --------------------
// messages
// --------------------

bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  if (!text || text.startsWith('/')) return;

  const session = sessions.get(chatId);
  if (!session) return;

  // -------- buttons --------

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

  if (text === '📊 История') {
    session.weightPage = 1;

    const data = await getWeights(session.token, 1);

    bot.sendMessage(
      chatId,
      formatWeights(data.items),
      weightNavKeyboard(1)
    );

    return;
  }

  // -------- input --------

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

  if (session.mode === 'note') {
    const title = `Telegram note ${new Date().toLocaleDateString()}`;

    await createNote(
      session.token,
      title,
      text
    );

    session.mode = undefined;

    bot.sendMessage(chatId, '📝 Заметка сохранена', mainKeyboard);
  }
});

// --------------------
// inline buttons
// --------------------

bot.on('callback_query', async (query) => {
  const chatId = query.message?.chat.id;
  if (!chatId) return;

  const session = sessions.get(chatId);
  if (!session) return;

  const data = query.data;
  if (!data) return;

  if (data.startsWith('WEIGHT_PREV')) {
    const page = Math.max(
      1,
      Number(data.split(':')[1]) - 1
    );

    const res = await getWeights(session.token, page);

    bot.editMessageText(
      formatWeights(res.items),
      {
        chat_id: chatId,
        message_id: query.message?.message_id,
        ...weightNavKeyboard(page)
      }
    );
  }

  if (data.startsWith('WEIGHT_NEXT')) {
    const page =
      Number(data.split(':')[1]) + 1;

    const res = await getWeights(session.token, page);

    bot.editMessageText(
      formatWeights(res.items),
      {
        chat_id: chatId,
        message_id: query.message?.message_id,
        ...weightNavKeyboard(page)
      }
    );
  }
});

// --------------------

console.log('🤖 Telegram bot started');