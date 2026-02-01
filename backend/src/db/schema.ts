import { pgTable, uuid, text, timestamp } from 'drizzle-orm/pg-core';

export const notes = pgTable('notes', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: text('title').notNull(),
  content: text('content'),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull()
});