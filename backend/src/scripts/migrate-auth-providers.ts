import { db } from "../db";
import { users, authProviders } from "../db/schema";
import { eq, and } from "drizzle-orm";

import { env } from "../config/env";

console.log("DATABASE_URL exists:", !!env.databaseUrl);
console.log("DATABASE_URL starts with:", env.databaseUrl.slice(0, 30));

/**
 * =========================================================
 * MIGRATE EMAIL USERS → AUTH PROVIDERS
 * =========================================================
 *
 * Этот скрипт нужен после внедрения новой схемы авторизации.
 *
 * Раньше:
 *
 * users
 *  email
 *  password_hash
 *
 * Теперь:
 *
 * users
 *  (только аккаунт)
 *
 * auth_providers
 *  provider
 *  providerId
 *  passwordHash
 *
 * Поэтому нужно перенести старые данные.
 */

async function migrateEmailProviders() {

  console.log("Starting migration...");
  

  /**
   * 1️⃣ Получаем всех пользователей
   * у которых есть email
   */
  const allUsers = await db.select().from(users);

  console.log(`Found ${allUsers.length} users`);

  for (const user of allUsers) {

    /**
     * Если у пользователя нет email
     * значит это не email-аккаунт
     */
    if (!user.email) continue;

    /**
     * Проверяем, существует ли уже provider
     * чтобы не создать дубликат
     */
    const existing = await db
      .select()
      .from(authProviders)
      .where(
        and(
          eq(authProviders.provider, "email"),
          eq(authProviders.providerId, user.email)
        )
      );

    if (existing.length > 0) {

      console.log(
        `Provider already exists for ${user.email}`
      );

      continue;
    }

    /**
     * Создаём email provider
     */
    await db.insert(authProviders).values({

      userId: user.id,

      provider: "email",

      providerId: user.email,

      passwordHash: user.passwordHash ?? null

    });

    console.log(
      `Created email provider for ${user.email}`
    );
  }

  console.log("Migration completed");
}

/**
 * Запускаем скрипт
 */
migrateEmailProviders()
  .then(() => {
    console.log("Done");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Migration failed:", err);
    process.exit(1);
  });