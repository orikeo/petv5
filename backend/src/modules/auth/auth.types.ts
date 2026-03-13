export interface RegisterDto {
  email: string;
  password: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface TelegramAuthDto {
  telegramId: string;
  username?: string;
}

/**
 * DTO для создания способа авторизации
 */
export interface CreateAuthProviderDto {
  userId: string;
  provider: "email" | "telegram";
  providerId: string;
  passwordHash?: string | null;
}