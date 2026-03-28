import { and, asc, eq, gte, lte } from "drizzle-orm";
import { db } from "../../db";
import { dailyCheckEntries, dailyCheckItems, dailyReports } from "../../db/schema";
import {
  CreateDailyCheckItemDto,
  DailyCheckItemDto,
  SaveDailyCheckEntryDto,
  SaveDailyReportDto,
  UpdateDailyCheckItemDto,
} from "./daily-check.types";

class DailyCheckRepository {
  private mapWeekDaysCsvToArray(value: string): number[] {
    if (!value.trim()) {
      return [];
    }

    return value
      .split(",")
      .map((item) => Number(item.trim()))
      .filter((item) => Number.isInteger(item) && item >= 1 && item <= 7);
  }

  private mapWeekDaysArrayToCsv(value: number[]): string {
    return value.join(",");
  }

  private mapItem(row: {
    id: string;
    userId: string;
    title: string;
    emoji: string | null;
    appliesMode: "every_day" | "selected_days";
    weekDaysCsv: string;
    sortOrder: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  }): DailyCheckItemDto {
    return {
      id: row.id,
      userId: row.userId,
      title: row.title,
      emoji: row.emoji,
      appliesMode: row.appliesMode,
      weekDays: this.mapWeekDaysCsvToArray(row.weekDaysCsv),
      sortOrder: row.sortOrder,
      isActive: row.isActive,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }

  async getItemsByUser(userId: string) {
    const rows = await db
      .select({
        id: dailyCheckItems.id,
        userId: dailyCheckItems.userId,
        title: dailyCheckItems.title,
        emoji: dailyCheckItems.emoji,
        appliesMode: dailyCheckItems.appliesMode,
        weekDaysCsv: dailyCheckItems.weekDaysCsv,
        sortOrder: dailyCheckItems.sortOrder,
        isActive: dailyCheckItems.isActive,
        createdAt: dailyCheckItems.createdAt,
        updatedAt: dailyCheckItems.updatedAt,
      })
      .from(dailyCheckItems)
      .where(eq(dailyCheckItems.userId, userId))
      .orderBy(asc(dailyCheckItems.sortOrder), asc(dailyCheckItems.createdAt));

    return rows.map((row) => this.mapItem(row));
  }

  async getItemById(id: string) {
    const [row] = await db
      .select({
        id: dailyCheckItems.id,
        userId: dailyCheckItems.userId,
        title: dailyCheckItems.title,
        emoji: dailyCheckItems.emoji,
        appliesMode: dailyCheckItems.appliesMode,
        weekDaysCsv: dailyCheckItems.weekDaysCsv,
        sortOrder: dailyCheckItems.sortOrder,
        isActive: dailyCheckItems.isActive,
        createdAt: dailyCheckItems.createdAt,
        updatedAt: dailyCheckItems.updatedAt,
      })
      .from(dailyCheckItems)
      .where(eq(dailyCheckItems.id, id));

    return row ? this.mapItem(row) : undefined;
  }

  async createItem(
    userId: string,
    dto: Required<Pick<CreateDailyCheckItemDto, "title" | "appliesMode" | "weekDays">> &
      Omit<CreateDailyCheckItemDto, "title" | "appliesMode" | "weekDays">
  ) {
    const [row] = await db
      .insert(dailyCheckItems)
      .values({
        userId,
        title: dto.title,
        emoji: dto.emoji ?? null,
        appliesMode: dto.appliesMode,
        weekDaysCsv: this.mapWeekDaysArrayToCsv(dto.weekDays),
        sortOrder: dto.sortOrder ?? 0,
        isActive: dto.isActive ?? true,
      })
      .returning({
        id: dailyCheckItems.id,
        userId: dailyCheckItems.userId,
        title: dailyCheckItems.title,
        emoji: dailyCheckItems.emoji,
        appliesMode: dailyCheckItems.appliesMode,
        weekDaysCsv: dailyCheckItems.weekDaysCsv,
        sortOrder: dailyCheckItems.sortOrder,
        isActive: dailyCheckItems.isActive,
        createdAt: dailyCheckItems.createdAt,
        updatedAt: dailyCheckItems.updatedAt,
      });

    return this.mapItem(row);
  }

  async updateItem(id: string, dto: UpdateDailyCheckItemDto) {
    const updateData: Partial<{
      title: string;
      emoji: string | null;
      appliesMode: "every_day" | "selected_days";
      weekDaysCsv: string;
      sortOrder: number;
      isActive: boolean;
      updatedAt: Date;
    }> = {
      updatedAt: new Date(),
    };

    if (dto.title !== undefined) updateData.title = dto.title;
    if (dto.emoji !== undefined) updateData.emoji = dto.emoji;
    if (dto.appliesMode !== undefined) updateData.appliesMode = dto.appliesMode;
    if (dto.weekDays !== undefined) updateData.weekDaysCsv = this.mapWeekDaysArrayToCsv(dto.weekDays);
    if (dto.sortOrder !== undefined) updateData.sortOrder = dto.sortOrder;
    if (dto.isActive !== undefined) updateData.isActive = dto.isActive;

    const [row] = await db
      .update(dailyCheckItems)
      .set(updateData)
      .where(eq(dailyCheckItems.id, id))
      .returning({
        id: dailyCheckItems.id,
        userId: dailyCheckItems.userId,
        title: dailyCheckItems.title,
        emoji: dailyCheckItems.emoji,
        appliesMode: dailyCheckItems.appliesMode,
        weekDaysCsv: dailyCheckItems.weekDaysCsv,
        sortOrder: dailyCheckItems.sortOrder,
        isActive: dailyCheckItems.isActive,
        createdAt: dailyCheckItems.createdAt,
        updatedAt: dailyCheckItems.updatedAt,
      });

    return row ? this.mapItem(row) : undefined;
  }

  async deleteItem(id: string) {
    const [row] = await db
      .delete(dailyCheckItems)
      .where(eq(dailyCheckItems.id, id))
      .returning({
        id: dailyCheckItems.id,
      });

    return row;
  }

  async getEntriesByUserAndDate(userId: string, date: string) {
    return db
      .select({
        id: dailyCheckEntries.id,
        itemId: dailyCheckEntries.itemId,
        status: dailyCheckEntries.status,
        skipReason: dailyCheckEntries.skipReason,
        date: dailyCheckEntries.date,
      })
      .from(dailyCheckEntries)
      .where(and(eq(dailyCheckEntries.userId, userId), eq(dailyCheckEntries.date, date)));
  }

  async deleteEntriesByUserAndDate(userId: string, date: string) {
    await db
      .delete(dailyCheckEntries)
      .where(and(eq(dailyCheckEntries.userId, userId), eq(dailyCheckEntries.date, date)));
  }

  async createEntries(userId: string, date: string, entries: SaveDailyCheckEntryDto[]) {
    if (entries.length === 0) {
      return [];
    }

    return db
      .insert(dailyCheckEntries)
      .values(
        entries.map((entry) => ({
          userId,
          itemId: entry.itemId,
          date,
          status: entry.status,
          skipReason: entry.status === "skipped" ? entry.skipReason ?? null : null,
          updatedAt: new Date(),
        }))
      )
      .returning({
        id: dailyCheckEntries.id,
        itemId: dailyCheckEntries.itemId,
        status: dailyCheckEntries.status,
        skipReason: dailyCheckEntries.skipReason,
        date: dailyCheckEntries.date,
      });
  }

  async getReportByUserAndDate(userId: string, date: string) {
    const [row] = await db
      .select({
        id: dailyReports.id,
        moodScore: dailyReports.moodScore,
        moodComment: dailyReports.moodComment,
        summary: dailyReports.summary,
        note: dailyReports.note,
        musicOfDay: dailyReports.musicOfDay,
        date: dailyReports.date,
      })
      .from(dailyReports)
      .where(and(eq(dailyReports.userId, userId), eq(dailyReports.date, date)));

    return row;
  }

  async upsertReport(userId: string, date: string, dto: SaveDailyReportDto) {
    const existing = await this.getReportByUserAndDate(userId, date);

    if (!existing) {
      const [created] = await db
        .insert(dailyReports)
        .values({
          userId,
          date,
          moodScore: dto.moodScore ?? null,
          moodComment: dto.moodComment ?? null,
          summary: dto.summary ?? null,
          note: dto.note ?? null,
          musicOfDay: dto.musicOfDay ?? null,
          updatedAt: new Date(),
        })
        .returning({
          id: dailyReports.id,
          moodScore: dailyReports.moodScore,
          moodComment: dailyReports.moodComment,
          summary: dailyReports.summary,
          note: dailyReports.note,
          musicOfDay: dailyReports.musicOfDay,
          date: dailyReports.date,
        });

      return created;
    }

    const [updated] = await db
      .update(dailyReports)
      .set({
        moodScore: dto.moodScore ?? null,
        moodComment: dto.moodComment ?? null,
        summary: dto.summary ?? null,
        note: dto.note ?? null,
        musicOfDay: dto.musicOfDay ?? null,
        updatedAt: new Date(),
      })
      .where(eq(dailyReports.id, existing.id))
      .returning({
        id: dailyReports.id,
        moodScore: dailyReports.moodScore,
        moodComment: dailyReports.moodComment,
        summary: dailyReports.summary,
        note: dailyReports.note,
        musicOfDay: dailyReports.musicOfDay,
        date: dailyReports.date,
      });

    return updated;
  }

  async getReportsInRange(userId: string, from: string, to: string) {
    return db
      .select({
        id: dailyReports.id,
        date: dailyReports.date,
        moodScore: dailyReports.moodScore,
        summary: dailyReports.summary,
        note: dailyReports.note,
      })
      .from(dailyReports)
      .where(
        and(
          eq(dailyReports.userId, userId),
          gte(dailyReports.date, from),
          lte(dailyReports.date, to)
        )
      );
  }

  async getEntriesInRange(userId: string, from: string, to: string) {
    return db
      .select({
        itemId: dailyCheckEntries.itemId,
        date: dailyCheckEntries.date,
        status: dailyCheckEntries.status,
      })
      .from(dailyCheckEntries)
      .where(
        and(
          eq(dailyCheckEntries.userId, userId),
          gte(dailyCheckEntries.date, from),
          lte(dailyCheckEntries.date, to)
        )
      );
  }
}

export const dailyCheckRepository = new DailyCheckRepository();