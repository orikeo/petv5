export const confirmKeyboard = (type: 'weight' | 'note') => ({
  reply_markup: {
    inline_keyboard: [
      [
        { text: '✅ Да', callback_data: `CONFIRM:${type}` },
        { text: '❌ Нет', callback_data: `CANCEL:${type}` }
      ]
    ]
  }
});