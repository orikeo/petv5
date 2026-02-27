import { sessions, setToken, getToken } from '../sessions/session.store';
import { handleWeightMessage } from './weight.handler';
import { handleNotesMessage } from './notes.handler';
import TelegramBot from 'node-telegram-bot-api';
import { getWeightHistory, confirmTelegramLink, getNotes, getNoteById } from '../api';
import { telegramLogin } from '../api';
import { BUTTONS } from '../constants/buttons';


export const handleMessage = async (
  bot: TelegramBot,
  msg: TelegramBot.Message
) => {
  

  const telegramId = String(msg.from?.id);
  if (!telegramId) return;

  let token = getToken(telegramId);

  if (!token) {
    const login = await telegramLogin(telegramId);
    setToken(telegramId, login.accessToken);
    token = login.accessToken;
  }

  const chatId = msg.chat.id;
  const text = msg.text;

  if (!text || text.startsWith('/')) return;

  const session = sessions.get(telegramId);
  if (!session) return;

  // ------------------------
  // LINK
  // ------------------------
  if (text.startsWith('LINK ')) {
    const code = text.split(' ')[1]?.trim();

    try {
      await confirmTelegramLink(code!, telegramId);

      return bot.sendMessage(
        chatId,
        '✅ Аккаунт успешно привязан'
      );
    } catch (e) {
      console.error('LINK ERROR:', e);
      return bot.sendMessage(
        chatId,
        '❌ Неверный или просроченный код'
      );
    }
  }

  // ------------------------
  // ИСТОРИЯ ВЕСА
  // ------------------------
  if (text === BUTTONS.WEIGHT_HISTORY) {
    const history = await getWeightHistory(
      session.token,
      1,
      5
    );

    if (history.items.length === 0) {
      return bot.sendMessage(
        chatId,
        'История пока пустая'
      );
    }

    const message = history.items
      .map(
        (i: { date: string; weight: number }) =>
          `${i.date} — ${i.weight} кг`
      )
      .join('\n');

    return bot.sendMessage(
      chatId,
      `📊 Последние измерения:\n\n${message}`
    );
  }

  // ------------------------
  // МОИ ЗАМЕТКИ (СПИСОК)
  // ------------------------
  if (text === BUTTONS.NOTES_LIST) {
    try {
      const notes = await getNotes(
        session.token,
        1,
        5
      );

      

      if (notes.items.length === 0) {
        return bot.sendMessage(
          chatId,
          'Заметок пока нет'
        );
      }

      session.notesList = notes.items;
      session.mode = 'notes_list';

      const message = notes.items
        .map(
          (n, i) =>
            `${i + 1}. ${n.title}`
        )
        .join('\n');

      return bot.sendMessage(
        chatId,
        `📝 Ваши заметки:\n\n${message}\n\nНапишите номер для просмотра`
      );
    } catch (e) {
      console.error('GET NOTES ERROR:', e);

      return bot.sendMessage(
        chatId,
        'Ошибка при получении заметок'
      );
    }
  }

  // ------------------------
  // ПРОСМОТР ЗАМЕТКИ ПО НОМЕРУ
  // ------------------------
  if (
    session.mode === 'notes_list' &&
    /^\d+$/.test(text)
  ) {
    const index = Number(text) - 1;

    const note = session.notesList?.[index];

    if (!note) {
      return bot.sendMessage(
        chatId,
        'Неверный номер'
      );
    }

    const fullNote = await getNoteById(
      session.token,
      note.id
    );

    session.mode = undefined;

    return bot.sendMessage(
      chatId,
      `📝 ${fullNote.title}\n\n${fullNote.content}`
    );
  }

  // ------------------------
  // ВВОД ВЕСА
  // ------------------------
  if (text === BUTTONS.WEIGHT_ADD || session.mode === 'weight') {
    return handleWeightMessage(bot, msg, session);
  }

  // ------------------------
  // ВВОД ЗАМЕТКИ
  // ------------------------
  if (text === BUTTONS.NOTE_ADD || session.mode === 'note') {
    return handleNotesMessage(bot, msg, session);
  }
};