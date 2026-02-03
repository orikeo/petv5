import { KeyboardButton, ReplyKeyboardMarkup } from 'node-telegram-bot-api';

export const mainKeyboard: { reply_markup: ReplyKeyboardMarkup } = {
  reply_markup: {
    keyboard: [
      [{ text: '➕ Вес' }, { text: '📝 Заметка' }],
      [{ text: '📊 История' }]
    ],
    resize_keyboard: true
  }
};