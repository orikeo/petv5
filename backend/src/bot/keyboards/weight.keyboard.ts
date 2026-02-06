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