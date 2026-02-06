import { db } from '../../db';
import { users, telegramLinkCodes } from '../../db/schema';
import { eq } from 'drizzle-orm';

class AuthRepository {
  async findByEmail(email: string) {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email));

    return user;
  }

  async create(email: string, passwordHash: string) {
    const [user] = await db
      .insert(users)
      .values({ email, passwordHash })
      .returning();

    return user;
  }

  async findByTelegramId(telegramId: string) {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.telegramId, telegramId));

  return user;
}

async createTelegramUser(telegramId: string) {
  const [user] = await db
    .insert(users)
    .values({
      telegramId
    })
    .returning();

  return user;
}

async saveTelegramLinkCode(
  code: string,
  userId: string
) {
  await db
    .insert(telegramLinkCodes)
    .values({
      code,
      userId,
      expiresAt: new Date(
        Date.now() + 5 * 60 * 1000
      )
    });
}

async findLinkCode(code: string) {
  const [row] = await db
    .select()
    .from(telegramLinkCodes)
    .where(eq(telegramLinkCodes.code, code));

  return row;
}

async attachTelegramToUser(
  userId: string,
  telegramId: string
) {
  await db
    .update(users)
    .set({ telegramId })
    .where(eq(users.id, userId));
}

async deleteLinkCode(code: string) {
  await db
    .delete(telegramLinkCodes)
    .where(eq(telegramLinkCodes.code, code));
}

}

export const authRepository = new AuthRepository();