import 'dotenv/config';
import { faker } from '@faker-js/faker';
import { db } from '../db';
import {
  users,
  notes,
  weightEntries
} from '../db/schema';
import { eq } from 'drizzle-orm';
import { UserRole } from '../modules/auth/auth.roles';

const SITE_USERS = 10;

async function seed() {
  console.log('🌱 Seeding database...');

  for (let i = 0; i < SITE_USERS; i++) {
    // 1. site user
    const [siteUser] = await db
      .insert(users)
      .values({
        email: faker.internet.email(),
        passwordHash: 'hash',
        role: UserRole.USER
      })
      .returning();

    // 2. telegram user (fake)
    const telegramId = faker.string.numeric(10);

    const [tgUser] = await db
      .insert(users)
      .values({
        telegramId,
        role: UserRole.USER
      })
      .returning();

    // 3. notes for telegram user
    await db.insert(notes).values([
      {
        userId: tgUser.id,
        title: faker.lorem.words(3),
        content: faker.lorem.sentences(2)
      },
      {
        userId: tgUser.id,
        title: faker.lorem.words(3),
        content: faker.lorem.sentences(2)
      }
    ]);

    // 4. weight entries
    await db.insert(weightEntries).values([
      {
        userId: tgUser.id,
        entryDate: faker.date.recent().toISOString(),
        weight: String(
          faker.number.float({ min: 65, max: 110 })
        ),
        note: faker.lorem.words(2)
      }
    ]);

    // 5. MERGE (симуляция)
    await db
      .update(notes)
      .set({ userId: siteUser.id })
      .where(eq(notes.userId, tgUser.id));

    await db
      .update(weightEntries)
      .set({ userId: siteUser.id })
      .where(eq(weightEntries.userId, tgUser.id));

    // delete telegram user FIRST
await db
  .delete(users)
  .where(eq(users.id, tgUser.id));

// attach telegram to site user
await db
  .update(users)
  .set({ telegramId })
  .where(eq(users.id, siteUser.id));
  }

  console.log('✅ Seed finished');
}

seed()
  .then(() => process.exit(0))
  .catch(err => {
    console.error(err);
    process.exit(1);
  });