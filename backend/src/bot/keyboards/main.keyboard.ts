import { ReplyKeyboardMarkup } from 'node-telegram-bot-api';
import { BUTTONS } from '../constants/buttons';


export const mainKeyboard: { reply_markup: ReplyKeyboardMarkup } = {
  reply_markup: {
    keyboard: [
      [{ text: BUTTONS.WEIGHT_ADD }, { text: BUTTONS.WEIGHT_HISTORY }],
      [{ text: BUTTONS.NOTE_ADD }, { text: BUTTONS.NOTES_LIST }]
    ],
    resize_keyboard: true
  }
};