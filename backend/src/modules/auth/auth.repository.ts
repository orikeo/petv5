import { db } from "../../db";
import {
  users,
  telegramLinkCodes,
  authProviders,
} from "../../db/schema";
import { eq, and } from "drizzle-orm";
import { CreateAuthProviderDto } from "./auth.types";

class AuthRepository {
  /**
   * =========================================================
   * USERS
   * =========================================================
   *
   * В новой схеме users = это просто аккаунт.
   * Способы входа теперь лежат отдельно в authProviders.
   */

  /**
   * создать нового пользователя-аккаунт
   *
   * ВАЖНО:
   * users.email / passwordHash / telegramId пока ещё
   * могут оставаться в таблице на переходный период,
   * но новая логика уже не должна на них опираться.
   */
  async createUser() {
  const [user] = await db
    .insert(users)
    .values({})
    .returning({
      id: users.id,
      role: users.role,
      createdAt: users.createdAt,
    });

  return user;
}

async findUserById(userId: string) {
  const [user] = await db
    .select({
      id: users.id,
      role: users.role,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(eq(users.id, userId));

  return user;
}

  /**
   * =========================================================
   * AUTH PROVIDERS
   * =========================================================
   *
   * authProviders = способы входа:
   * - email
   * - telegram
   * - позже google / github / apple
   */

  /**
   * создать способ авторизации
   *
   * пример:
   * provider = "email"
   * providerId = "user@mail.com"
   *
   * или:
   * provider = "telegram"
   * providerId = "123456789"
   */
  async createAuthProvider(data: CreateAuthProviderDto) {
    const [provider] = await db
      .insert(authProviders)
      .values({
        userId: data.userId,
        provider: data.provider,
        providerId: data.providerId,
        passwordHash: data.passwordHash ?? null,
      })
      .returning();

    return provider;
  }

  /**
   * найти email provider
   */
  async findEmailAuth(email: string) {
    const [provider] = await db
      .select()
      .from(authProviders)
      .where(
        and(
          eq(authProviders.provider, "email"),
          eq(authProviders.providerId, email)
        )
      );

    return provider;
  }

  /**
   * найти telegram provider
   */
  async findTelegramAuth(telegramId: string) {
    const [provider] = await db
      .select()
      .from(authProviders)
      .where(
        and(
          eq(authProviders.provider, "telegram"),
          eq(authProviders.providerId, telegramId)
        )
      );

    return provider;
  }

  /**
   * =========================================================
   * TELEGRAM LINK CODES
   * =========================================================
   *
   * Используются для привязки Telegram
   * к уже существующему аккаунту.
   */

  async saveTelegramLinkCode(code: string, userId: string) {
    await db
      .insert(telegramLinkCodes)
      .values({
        code,
        userId,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000),
      });
  }

  async findTelegramLinkCode(code: string) {
    const [linkCode] = await db
      .select()
      .from(telegramLinkCodes)
      .where(eq(telegramLinkCodes.code, code));

    return linkCode;
  }

  async deleteTelegramLinkCode(code: string) {
    await db
      .delete(telegramLinkCodes)
      .where(eq(telegramLinkCodes.code, code));
  }
}

export const authRepository = new AuthRepository();