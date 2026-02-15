import { Session } from './session.types';

export const sessions = new Map<string, Session>();

export const setToken = (
  telegramId: string,
  token: string
) => {
  sessions.set(telegramId, { token });
};

export const getToken = (
  telegramId: string
) => {
  return sessions.get(telegramId)?.token;
};