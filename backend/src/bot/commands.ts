import {
  KeyboardButton,
  ReplyKeyboardMarkup
} from 'node-telegram-bot-api';

export const mainKeyboard: {
  reply_markup: ReplyKeyboardMarkup;
} = {
  reply_markup: {
    keyboard: [
      [
        { text: '➕ Вес' },
        { text: '📝 Заметка' }
      ],
      [
        { text: '📊 История' },
        { text: '📓 Заметки' }
      ]
    ],
    resize_keyboard: true
  }
};

export const weightNavKeyboard = (page: number) => ({
  reply_markup: {
    inline_keyboard: [
      [
        { text: '⬅️', callback_data: `WEIGHT_PREV:${page}` },
        { text: '➡️', callback_data: `WEIGHT_NEXT:${page}` }
      ]
    ]
  }
});

export const notesNavKeyboard = (page: number) => ({
  reply_markup: {
    inline_keyboard: [
      [
        { text: '⬅️', callback_data: `NOTES_PREV:${page}` },
        { text: '➡️', callback_data: `NOTES_NEXT:${page}` }
      ]
    ]
  }
});

export const noteItemButton = (id: string, title: string) => ({
  text: title.slice(0, 30),
  callback_data: `NOTE_OPEN:${id}`
});