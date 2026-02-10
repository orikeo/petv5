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
    '/weights',
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

export const getWeights = async (
  token: string,
  page: number,
  limit = 5
) => {
  const res = await api.get(
    `/weights?page=${page}&limit=${limit}`,
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );

  return res.data as {
    items: {
      entryDate: string;
      weight: string;
    }[];
    total: number;
    page: number;
    limit: number;
  };
};

export const getNotes = async (
  token: string,
  page: number,
  limit = 5
) => {
  const res = await api.get(
    `/notes?page=${page}&limit=${limit}`,
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );

  return res.data as {
    items: {
      id: string;
      title: string;
      createdAt: string;
    }[];
    total: number;
    page: number;
    limit: number;
  };
};

export const getNoteById = async (
  token: string,
  id: string
) => {
  const res = await api.get(
    `/notes/${id}`,
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );

  return res.data as {
    id: string;
    title: string;
    content: string;
  };
};

export const getWeightHistory = async (
  token: string,
  page: number,
  limit: number
) => {
  const res = await api.get('/weights/history', {
    headers: {
      Authorization: `Bearer ${token}`
    },
    params: { page, limit }
  });

  return res.data;
};

export const confirmTelegramLink = async (
  code: string,
  telegramId: string
) => {
  const res = await api.post('/auth/telegram/confirm', {
    code,
    telegramId
  });

  return res.data;
};