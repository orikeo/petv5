import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000',
  timeout: 5000
});

export const telegramAuth = async (telegramId: string) => {
  const res = await api.post('/auth/telegram', {
    telegramId
  });

  return res.data.accessToken as string;
};

export const createWeight = async (
  token: string,
  entryDate: string,
  weight: number,
  note?: string
) => {
  await api.post(
    '/weight',
    { entryDate, weight, note },
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );
};

export const createNote = async (
  token: string,
  title: string,
  content?: string
) => {
  await api.post(
    '/notes',
    { title, content },
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );
};