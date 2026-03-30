import { AppError } from "../../errors/app-error";

/**
 * =========================================================
 * DAILY CHECK TIME HELPERS
 * =========================================================
 */

export const DAILY_CHECK_DEADLINE_HOUR = 12;

/**
 * Проверка и нормализация timezone
 */
export function normalizeTimeZone(timeZone?: string | null): string {
  const normalized = timeZone?.trim() || "UTC";

  try {
    Intl.DateTimeFormat("en-US", { timeZone: normalized }).format(new Date());
    return normalized;
  } catch {
    throw new AppError("Некорректный timeZone", 400);
  }
}

/**
 * Текущая UTC дата как YYYY-MM-DD
 */
export function getTodayUtcDateString(now = new Date()): string {
  return now.toISOString().slice(0, 10);
}

function getDateTimeParts(date: Date, timeZone: string) {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  const parts = formatter.formatToParts(date);

  const part = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((item) => item.type === type)?.value ?? "00";

  return {
    year: Number(part("year")),
    month: Number(part("month")),
    day: Number(part("day")),
    hour: Number(part("hour")),
    minute: Number(part("minute")),
    second: Number(part("second")),
  };
}

function getTimeZoneOffsetMs(timeZone: string, date: Date): number {
  const parts = getDateTimeParts(date, timeZone);

  const localAsUtcMs = Date.UTC(
    parts.year,
    parts.month - 1,
    parts.day,
    parts.hour,
    parts.minute,
    parts.second
  );

  return localAsUtcMs - date.getTime();
}

function zonedDateTimeToUtc(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  second: number,
  timeZone: string
): Date {
  const localAsUtcMs = Date.UTC(year, month - 1, day, hour, minute, second);

  let utcMs = localAsUtcMs;

  for (let index = 0; index < 3; index += 1) {
    const offset = getTimeZoneOffsetMs(timeZone, new Date(utcMs));
    utcMs = localAsUtcMs - offset;
  }

  return new Date(utcMs);
}

/**
 * Добавить N дней к строке YYYY-MM-DD
 */
export function addDaysToDateString(value: string, days: number): string {
  const cursor = new Date(`${value}T00:00:00.000Z`);
  cursor.setUTCDate(cursor.getUTCDate() + days);

  const year = cursor.getUTCFullYear();
  const month = `${cursor.getUTCMonth() + 1}`.padStart(2, "0");
  const day = `${cursor.getUTCDate()}`.padStart(2, "0");

  return `${year}-${month}-${day}`;
}

/**
 * День недели для YYYY-MM-DD
 *
 * Возвращаем:
 * 1 = Monday
 * ...
 * 7 = Sunday
 */
export function getDateStringDayOfWeek(value: string): number {
  const date = new Date(`${value}T00:00:00.000Z`);
  const jsDay = date.getUTCDay();

  return jsDay === 0 ? 7 : jsDay;
}

/**
 * Для даты D дедлайн = следующий день 12:00 по timezone пользователя
 */
export function buildDailyReportDeadlineAt(
  date: string,
  timeZone: string
): Date {
  const nextDate = addDaysToDateString(date, 1);
  const [year, month, day] = nextDate.split("-").map(Number);

  return zonedDateTimeToUtc(
    year,
    month,
    day,
    DAILY_CHECK_DEADLINE_HOUR,
    0,
    0,
    timeZone
  );
}

/**
 * Проверка, прошёл ли дедлайн
 */
export function isAfterDeadline(deadlineAt: Date, now = new Date()): boolean {
  return now.getTime() > deadlineAt.getTime();
}