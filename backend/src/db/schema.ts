import { pgTable, uuid, text, timestamp, date, numeric, boolean, integer, index, uniqueIndex } from 'drizzle-orm/pg-core';
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
    expiresAt: timestamp('expires_at', {
  withTimezone: true
}).notNull()
  }
);

export const cars = pgTable('cars', {
  id: uuid('id').defaultRandom().primaryKey(),

  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),

  name: text('name').notNull(),

  createdAt: timestamp('created_at').defaultNow().notNull()
});

export const repairTypes = pgTable('repair_types', {
  id: uuid('id').defaultRandom().primaryKey(),

  name: text('name').notNull()
});

export const fuelLogs = pgTable(
  'fuel_logs',
  {
    id: uuid('id').defaultRandom().primaryKey(),

    carId: uuid('car_id')
      .notNull()
      .references(() => cars.id, { onDelete: 'cascade' }),

    // пробег на момент заправки
    odometer: integer('odometer').notNull(),

    // количество литров
    liters: numeric('liters', { precision: 10, scale: 2 }).notNull(),

    // цена за литр
    pricePerLiter: numeric('price_per_liter', {
      precision: 10,
      scale: 2
    }),

    // общая стоимость
    totalPrice: numeric('total_price', {
      precision: 10,
      scale: 2
    }),

    // был ли полный бак
    fullTank: boolean('full_tank')
      .notNull()
      .default(true),

    // название заправки (опционально)
    station: text('station'),

    createdAt: timestamp('created_at')
      .defaultNow()
      .notNull()
  },

  (table) => ({
    // быстрый поиск по машине
    carIdx: index('fuel_logs_car_idx').on(table.carId),

    // защита от двух одинаковых пробегов
    uniqueOdometerPerCar: uniqueIndex(
      'fuel_logs_car_odometer_idx'
    ).on(table.carId, table.odometer)
  })
);

export const repairs = pgTable(
  'repairs',
  {
    id: uuid('id').defaultRandom().primaryKey(),

    carId: uuid('car_id')
      .notNull()
      .references(() => cars.id, { onDelete: 'cascade' }),

    repairTypeId: uuid('repair_type_id')
      .notNull()
      .references(() => repairTypes.id),

    // пробег на момент ремонта
    odometer: integer('odometer'),

    // стоимость ремонта
    price: numeric('price', { precision: 10, scale: 2 })
      .notNull(),

    // заметка
    note: text('note'),

    createdAt: timestamp('created_at')
      .defaultNow()
      .notNull()
  },

  (table) => ({
    // быстрый поиск ремонтов машины
    carIdx: index('repairs_car_idx').on(table.carId),

    // если захочешь смотреть статистику по типам ремонта
    repairTypeIdx: index('repairs_type_idx').on(table.repairTypeId)
  })
);