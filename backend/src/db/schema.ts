import {
  pgTable,
  uuid,
  text,
  timestamp,
  date,
  numeric,
  boolean,
  integer,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { pgEnum } from "drizzle-orm/pg-core";
import { UserRole } from "../modules/auth/auth.roles";

export const userRoleEnum = pgEnum("user_role", [
  UserRole.OWNER,
  UserRole.ADMIN,
  UserRole.USER,
]);

export const dailyCheckAppliesModeEnum = pgEnum("daily_check_applies_mode", [
  "every_day",
  "selected_days",
]);

export const dailyCheckStatusEnum = pgEnum("daily_check_status", [
  "yes",
  "no",
  "skipped",
]);

export const dailyReportLifecycleStatusEnum = pgEnum(
  "daily_report_lifecycle_status",
  ["open", "completed", "partial", "missed"]
);

export const notes = pgTable("notes", {
  id: uuid("id").defaultRandom().primaryKey(),

  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),

  title: text("title").notNull(),
  content: text("content"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),

  role: userRoleEnum("role").notNull().default(UserRole.USER),

  createdAt: timestamp("created_at").defaultNow().notNull(),
});

/**
 * новая таблица способов авторизации
 *
 * один user может иметь несколько способов входа:
 * - email
 * - telegram
 * - google
 * и т.д.
 */
export const authProviders = pgTable(
  "auth_providers",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    /**
     * ссылка на основную запись пользователя
     */
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, {
        onDelete: "cascade",
      }),

    /**
     * тип способа входа
     * например:
     * - email
     * - telegram
     */
    provider: text("provider").notNull(),

    /**
     * идентификатор внутри провайдера
     *
     * для email это email
     * для telegram это telegram_id
     */
    providerId: text("provider_id").notNull(),

    /**
     * пароль нужен не всем провайдерам
     * для email/password он есть
     * для telegram обычно null
     */
    passwordHash: text("password_hash"),

    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    /**
     * нельзя дважды создать один и тот же provider/providerId
     *
     * например:
     * email + same@mail.com
     * не должен существовать два раза
     */
    providerProviderIdUnique: uniqueIndex(
      "auth_providers_provider_provider_id_idx"
    ).on(table.provider, table.providerId),
    userIdx: index("auth_providers_user_id_idx").on(table.userId),
  })
);

export const weightEntries = pgTable("weight_entries", {
  id: uuid("id").defaultRandom().primaryKey(),

  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),

  entryDate: date("entry_date").notNull(),

  weight: numeric("weight", { precision: 5, scale: 2 }).notNull(),

  note: text("note"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const telegramLinkCodes = pgTable("telegram_link_codes", {
  code: text("code").primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expiresAt: timestamp("expires_at", {
    withTimezone: true,
  }).notNull(),
});

export const cars = pgTable("cars", {
  id: uuid("id").defaultRandom().primaryKey(),

  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),

  name: text("name").notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const repairTypes = pgTable("repair_types", {
  id: uuid("id").defaultRandom().primaryKey(),

  name: text("name").notNull(),
});

export const fuelLogs = pgTable(
  "fuel_logs",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    carId: uuid("car_id")
      .notNull()
      .references(() => cars.id, { onDelete: "cascade" }),

    fuelDate: date("fuel_date").notNull(),

    odometer: integer("odometer"),

    liters: numeric("liters", { precision: 10, scale: 2 }).notNull(),

    pricePerLiter: numeric("price_per_liter", {
      precision: 10,
      scale: 2,
    }).notNull(),

    totalPrice: numeric("total_price", {
      precision: 10,
      scale: 2,
    }).notNull(),

    fullTank: boolean("full_tank").notNull().default(false),

    station: text("station"),

    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    carIdx: index("fuel_logs_car_idx").on(table.carId),
    carDateIdx: index("fuel_logs_car_date_idx").on(table.carId, table.fuelDate),
    carOdometerIdx: index("fuel_logs_car_odometer_idx").on(
      table.carId,
      table.odometer
    ),
  })
);

export const repairs = pgTable(
  "repairs",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    carId: uuid("car_id")
      .notNull()
      .references(() => cars.id, { onDelete: "cascade" }),

    repairTypeId: uuid("repair_type_id")
      .notNull()
      .references(() => repairTypes.id),

    repairDate: date("repair_date").notNull(),

    odometer: integer("odometer"),

    price: numeric("price", { precision: 10, scale: 2 }).notNull(),

    note: text("note"),

    createdAt: timestamp("created_at").defaultNow().notNull(),
  },

  (table) => ({
    carIdx: index("repairs_car_idx").on(table.carId),
    repairTypeIdx: index("repairs_type_idx").on(table.repairTypeId),
    carRepairDateIdx: index("repairs_car_repair_date_idx").on(
      table.carId,
      table.repairDate
    ),
  })
);

export const plannerItems = pgTable("planner_items", {
  id: uuid("id").defaultRandom().primaryKey(),

  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),

  date: date("date").notNull(),

  title: text("title").notNull(),
  description: text("description"),

  isDone: boolean("is_done").notNull().default(false),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const dailyCheckItems = pgTable(
  "daily_check_items",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    title: text("title").notNull(),
    emoji: text("emoji"),

    appliesMode: dailyCheckAppliesModeEnum("applies_mode")
      .notNull()
      .default("every_day"),

    /**
     * Храним как csv:
     * "1,2,3,4,5"
     */
    weekDaysCsv: text("week_days_csv").notNull().default(""),

    sortOrder: integer("sort_order").notNull().default(0),

    /**
     * VERSIONING:
     * startDate включительно
     * endDate НЕ включительно
     */
    startDate: date("start_date").notNull(),
    endDate: date("end_date"),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    userSortIdx: index("daily_check_items_user_sort_idx").on(
      table.userId,
      table.sortOrder
    ),
    userStartDateIdx: index("daily_check_items_user_start_date_idx").on(
      table.userId,
      table.startDate
    ),
  })
);

export const dailyReports = pgTable(
  "daily_reports",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    /**
     * День, за который пользователь отчитывается.
     * Это НЕ createdAt.
     */
    date: date("date").notNull(),

    moodScore: integer("mood_score"),
    moodComment: text("mood_comment"),

    summary: text("summary"),
    note: text("note"),
    musicOfDay: text("music_of_day"),

    status: dailyReportLifecycleStatusEnum("status")
      .notNull()
      .default("open"),

    /**
     * Дедлайн: следующий день 12:00 по timezone пользователя
     */
    deadlineAt: timestamp("deadline_at", { withTimezone: true }),

    closedAt: timestamp("closed_at", { withTimezone: true }),
    completedAt: timestamp("completed_at", { withTimezone: true }),

    wasEditedAfterDeadline: boolean("was_edited_after_deadline")
      .notNull()
      .default(false),

    timeZone: text("time_zone").notNull().default("UTC"),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    uniqueUserDate: uniqueIndex("daily_reports_user_date_idx").on(
      table.userId,
      table.date
    ),
  })
);

export const dailyCheckEntries = pgTable(
  "daily_check_entries",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    itemId: uuid("item_id")
      .notNull()
      .references(() => dailyCheckItems.id, { onDelete: "cascade" }),

    date: date("date").notNull(),

    status: dailyCheckStatusEnum("status").notNull(),
    skipReason: text("skip_reason"),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    uniqueUserDateItem: uniqueIndex("daily_check_entries_user_date_item_idx").on(
      table.userId,
      table.date,
      table.itemId
    ),
  })
);