import { pgTable, uuid, text, timestamp, date, numeric } from 'drizzle-orm/pg-core';
import { pgEnum } from 'drizzle-orm/pg-core';
import { UserRole } from '../modules/auth/auth.roles';

export const userRoleEnum = pgEnum('user_role', [
  UserRole.OWNER,
  UserRole.ADMIN,
  UserRole.USER
]);

export const notes = pgTable('notes', {
  id: uuid('id').defaultRandom().primaryKey(),

  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),

  title: text('title').notNull(),
  content: text('content'),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),

  email: text('email').unique(),
  passwordHash: text('password_hash'),

  telegramId: text('telegram_id').unique(),

  role: userRoleEnum('role')
    .notNull()
    .default(UserRole.USER),

  createdAt: timestamp('created_at').defaultNow().notNull()
});

export const weightEntries = pgTable('weight_entries', {
  id: uuid('id').defaultRandom().primaryKey(),

  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),

  entryDate: date('entry_date').notNull(),

  weight: numeric('weight', { precision: 5, scale: 2 }).notNull(),

  note: text('note'),

  createdAt: timestamp('created_at').defaultNow().notNull()
});

export const telegramLinkCodes = pgTable(
  'telegram_link_codes',
  {
    code: text('code').primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    expiresAt: timestamp('expires_at').notNull()
  }
);