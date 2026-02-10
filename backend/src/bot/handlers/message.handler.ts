import { sessions } from '../sessions/session.store';
import { handleWeightMessage } from './weight.handler';
import { handleNotesMessage } from './notes.handler';
import TelegramBot from 'node-telegram-bot-api';
import { WeightHistoryItem } from '../../modules/weight/weight.types';
import { getWeightHistory, confirmTelegramLink } from '../api';

export const handleMessage = async ( 
  bot: TelegramBot,
  msg: TelegramBot.Message
) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  if (!text || text.startsWith('/')) return;

  const session = sessions.get(chatId);
  if (!session) return;

  if (text?.startsWith('LINK ')) {
  const rawCode = text.split(' ')[1];
  const code = rawCode?.trim();

  console.log('--- TELEGRAM LINK COMMAND ---');
  console.log('RAW TEXT:', JSON.stringify(text));
  console.log('RAW CODE:', JSON.stringify(rawCode));
  console.log('TRIMMED CODE:', JSON.stringify(code));

  try {
    await confirmTelegramLink(
      code!,
      String(msg.from?.id)
    );

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

  if (text === '➕ Вес' || session.mode === 'weight') {
    return handleWeightMessage(bot, msg, session);
  }

  if (text === '📝 Заметка' || session.mode === 'note') {
    return handleNotesMessage(bot, msg, session);
  }

  if (text === '📊 История') {
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
};