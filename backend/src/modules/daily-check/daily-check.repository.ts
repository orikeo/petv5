import { and, asc, eq, gt, gte, isNull, lte, or } from "drizzle-orm";
import { db } from "../../db";
import {
  dailyCheckEntries,
  dailyCheckItems,
  dailyReports,
} from "../../db/schema";
import {
  CreateDailyCheckItemDto,
  DailyCheckAppliesMode,
  DailyCheckItemDto,
  DailyCheckStatus,
  DailyReportLifecycleStatus,
  DailyReportRowDto,
  SaveDailyCheckEntryDto,
  UpdateDailyCheckItemDto,
  UpsertDailyReportDto,
} from "./daily-check.types";

type DailyCheckItemRow = {
  id: string;
  userId: string;
  title: string;
  emoji: string | null;
  appliesMode: string;
  weekDaysCsv: string;
  sortOrder: number | null;
  startDate: string;
  endDate: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type DailyCheckEntryRow = {
  id: string;
  itemId: string;
  status: DailyCheckStatus;
  skipReason: string | null;
  date: string;
};

export type DailyCheckRangeEntryRow = {
  itemId: string;
  date: string;
  status: DailyCheckStatus;
};

type DailyReportRow = {
  id: string;
  date: string;
  moodScore: number | null;
  moodComment: string | null;
  summary: string | null;
  note: string | null;
  musicOfDay: string | null;
  status: DailyReportLifecycleStatus;
  deadlineAt: Date | null;
  closedAt: Date | null;
  completedAt: Date | null;
  wasEditedAfterDeadline: boolean;
  timeZone: string;
  createdAt: Date;
  updatedAt: Date;
};

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

  private mapItem(row: DailyCheckItemRow): DailyCheckItemDto {
    const appliesMode: DailyCheckAppliesMode =
      row.appliesMode === "selected_days" ? "selected_days" : "every_day";

    return {
      id: row.id,
      userId: row.userId,
      title: row.title,
      emoji: row.emoji,
      appliesMode,
      weekDays: this.mapWeekDaysCsvToArray(row.weekDaysCsv),
      sortOrder: row.sortOrder ?? 0,
      startDate: row.startDate,
      endDate: row.endDate,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }

  private mapReport(row: DailyReportRow): DailyReportRowDto {
    return {
      id: row.id,
      date: row.date,
      moodScore: row.moodScore,
      moodComment: row.moodComment,
      summary: row.summary,
      note: row.note,
      musicOfDay: row.musicOfDay,
      status: row.status,
      deadlineAt: row.deadlineAt,
      closedAt: row.closedAt,
      completedAt: row.completedAt,
      wasEditedAfterDeadline: row.wasEditedAfterDeadline,
      timeZone: row.timeZone,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }

  /**
   * Текущий список привычек для экрана управления.
   * Показываем только активные версии (endDate is null).
   */
  async getItemsByUser(userId: string): Promise<DailyCheckItemDto[]> {
    const rows: DailyCheckItemRow[] = await db
      .select({
        id: dailyCheckItems.id,
        userId: dailyCheckItems.userId,
        title: dailyCheckItems.title,
        emoji: dailyCheckItems.emoji,
        appliesMode: dailyCheckItems.appliesMode,
        weekDaysCsv: dailyCheckItems.weekDaysCsv,
        sortOrder: dailyCheckItems.sortOrder,
        startDate: dailyCheckItems.startDate,
        endDate: dailyCheckItems.endDate,
        createdAt: dailyCheckItems.createdAt,
        updatedAt: dailyCheckItems.updatedAt,
      })
      .from(dailyCheckItems)
      .where(
        and(eq(dailyCheckItems.userId, userId), isNull(dailyCheckItems.endDate))
      )
      .orderBy(asc(dailyCheckItems.sortOrder), asc(dailyCheckItems.createdAt));

    return rows.map((row) => this.mapItem(row));
  }

  async getItemById(id: string): Promise<DailyCheckItemDto | undefined> {
    const [row]: DailyCheckItemRow[] = await db
      .select({
        id: dailyCheckItems.id,
        userId: dailyCheckItems.userId,
        title: dailyCheckItems.title,
        emoji: dailyCheckItems.emoji,
        appliesMode: dailyCheckItems.appliesMode,
        weekDaysCsv: dailyCheckItems.weekDaysCsv,
        sortOrder: dailyCheckItems.sortOrder,
        startDate: dailyCheckItems.startDate,
        endDate: dailyCheckItems.endDate,
        createdAt: dailyCheckItems.createdAt,
        updatedAt: dailyCheckItems.updatedAt,
      })
      .from(dailyCheckItems)
      .where(eq(dailyCheckItems.id, id));

    return row ? this.mapItem(row) : undefined;
  }

  /**
   * Версии привычек, которые действуют на конкретную дату.
   *
   * startDate <= date
   * endDate IS NULL OR endDate > date
   *
   * endDate НЕ включительно.
   */
  async getItemsByUserAndDate(
    userId: string,
    date: string
  ): Promise<DailyCheckItemDto[]> {
    const rows: DailyCheckItemRow[] = await db
      .select({
        id: dailyCheckItems.id,
        userId: dailyCheckItems.userId,
        title: dailyCheckItems.title,
        emoji: dailyCheckItems.emoji,
        appliesMode: dailyCheckItems.appliesMode,
        weekDaysCsv: dailyCheckItems.weekDaysCsv,
        sortOrder: dailyCheckItems.sortOrder,
        startDate: dailyCheckItems.startDate,
        endDate: dailyCheckItems.endDate,
        createdAt: dailyCheckItems.createdAt,
        updatedAt: dailyCheckItems.updatedAt,
      })
      .from(dailyCheckItems)
      .where(
        and(
          eq(dailyCheckItems.userId, userId),
          lte(dailyCheckItems.startDate, date),
          or(isNull(dailyCheckItems.endDate), gt(dailyCheckItems.endDate, date))
        )
      )
      .orderBy(asc(dailyCheckItems.sortOrder), asc(dailyCheckItems.createdAt));

    return rows.map((row) => this.mapItem(row));
  }

  /**
   * Все версии привычек, которые пересекают диапазон.
   * Нужно для /range.
   */
  async getItemsByUserInRange(
    userId: string,
    from: string,
    to: string
  ): Promise<DailyCheckItemDto[]> {
    const rows: DailyCheckItemRow[] = await db
      .select({
        id: dailyCheckItems.id,
        userId: dailyCheckItems.userId,
        title: dailyCheckItems.title,
        emoji: dailyCheckItems.emoji,
        appliesMode: dailyCheckItems.appliesMode,
        weekDaysCsv: dailyCheckItems.weekDaysCsv,
        sortOrder: dailyCheckItems.sortOrder,
        startDate: dailyCheckItems.startDate,
        endDate: dailyCheckItems.endDate,
        createdAt: dailyCheckItems.createdAt,
        updatedAt: dailyCheckItems.updatedAt,
      })
      .from(dailyCheckItems)
      .where(
        and(
          eq(dailyCheckItems.userId, userId),
          lte(dailyCheckItems.startDate, to),
          or(isNull(dailyCheckItems.endDate), gt(dailyCheckItems.endDate, from))
        )
      )
      .orderBy(asc(dailyCheckItems.sortOrder), asc(dailyCheckItems.createdAt));

    return rows.map((row) => this.mapItem(row));
  }

  async createItem(
    userId: string,
    dto: Required<
      Pick<
        CreateDailyCheckItemDto,
        "title" | "appliesMode" | "weekDays" | "effectiveFrom"
      >
    > &
      Omit<
        CreateDailyCheckItemDto,
        "title" | "appliesMode" | "weekDays" | "effectiveFrom"
      >
  ): Promise<DailyCheckItemDto> {
    const [row]: DailyCheckItemRow[] = await db
      .insert(dailyCheckItems)
      .values({
        userId,
        title: dto.title,
        emoji: dto.emoji ?? null,
        appliesMode: dto.appliesMode,
        weekDaysCsv: this.mapWeekDaysArrayToCsv(dto.weekDays),
        sortOrder: dto.sortOrder ?? 0,
        startDate: dto.effectiveFrom,
      })
      .returning({
        id: dailyCheckItems.id,
        userId: dailyCheckItems.userId,
        title: dailyCheckItems.title,
        emoji: dailyCheckItems.emoji,
        appliesMode: dailyCheckItems.appliesMode,
        weekDaysCsv: dailyCheckItems.weekDaysCsv,
        sortOrder: dailyCheckItems.sortOrder,
        startDate: dailyCheckItems.startDate,
        endDate: dailyCheckItems.endDate,
        createdAt: dailyCheckItems.createdAt,
        updatedAt: dailyCheckItems.updatedAt,
      });

    return this.mapItem(row);
  }

  /**
   * versioned update:
   * 1) закрываем старую версию endDate = effectiveFrom
   * 2) создаём новую версию startDate = effectiveFrom
   */
  async updateItem(
    id: string,
    dto: Required<Pick<UpdateDailyCheckItemDto, "effectiveFrom">> & {
      title: string;
      emoji: string | null;
      appliesMode: DailyCheckAppliesMode;
      weekDays: number[];
      sortOrder: number;
    }
  ): Promise<DailyCheckItemDto | undefined> {
    const existing = await this.getItemById(id);

    if (!existing) {
      return undefined;
    }

    return db.transaction(async (tx) => {
      await tx
        .update(dailyCheckItems)
        .set({
          endDate: dto.effectiveFrom,
          updatedAt: new Date(),
        })
        .where(eq(dailyCheckItems.id, id));

      const [created]: DailyCheckItemRow[] = await tx
        .insert(dailyCheckItems)
        .values({
          userId: existing.userId,
          title: dto.title,
          emoji: dto.emoji,
          appliesMode: dto.appliesMode,
          weekDaysCsv: this.mapWeekDaysArrayToCsv(dto.weekDays),
          sortOrder: dto.sortOrder,
          startDate: dto.effectiveFrom,
        })
        .returning({
          id: dailyCheckItems.id,
          userId: dailyCheckItems.userId,
          title: dailyCheckItems.title,
          emoji: dailyCheckItems.emoji,
          appliesMode: dailyCheckItems.appliesMode,
          weekDaysCsv: dailyCheckItems.weekDaysCsv,
          sortOrder: dailyCheckItems.sortOrder,
          startDate: dailyCheckItems.startDate,
          endDate: dailyCheckItems.endDate,
          createdAt: dailyCheckItems.createdAt,
          updatedAt: dailyCheckItems.updatedAt,
        });

      /**
       * Если пользователь меняет привычку с даты effectiveFrom,
       * уже существующие записи этого же дня (и потенциально будущих дней)
       * должны продолжить относиться к новой версии привычки.
       *
       * Иначе после versioned update остаются "осиротевшие" entries на старый itemId,
       * из-за чего overview может показывать невозможные значения вроде 6/5.
       */
      await tx
        .update(dailyCheckEntries)
        .set({
          itemId: created.id,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(dailyCheckEntries.userId, existing.userId),
            eq(dailyCheckEntries.itemId, existing.id),
            gte(dailyCheckEntries.date, dto.effectiveFrom)
          )
        );

      return this.mapItem(created);
    });
  }

  /**
   * Удаление теперь не физическое.
   * Мы просто закрываем текущую версию.
   */
  async deleteItem(
    id: string,
    effectiveFrom: string
  ): Promise<{ id: string } | undefined> {
    const [row] = await db
      .update(dailyCheckItems)
      .set({
        endDate: effectiveFrom,
        updatedAt: new Date(),
      })
      .where(eq(dailyCheckItems.id, id))
      .returning({
        id: dailyCheckItems.id,
      });

    return row;
  }

  async getEntriesByUserAndDate(
    userId: string,
    date: string
  ): Promise<DailyCheckEntryRow[]> {
    return db
      .select({
        id: dailyCheckEntries.id,
        itemId: dailyCheckEntries.itemId,
        status: dailyCheckEntries.status,
        skipReason: dailyCheckEntries.skipReason,
        date: dailyCheckEntries.date,
      })
      .from(dailyCheckEntries)
      .where(
        and(eq(dailyCheckEntries.userId, userId), eq(dailyCheckEntries.date, date))
      );
  }

  async deleteEntriesByUserAndDate(userId: string, date: string): Promise<void> {
    await db
      .delete(dailyCheckEntries)
      .where(
        and(eq(dailyCheckEntries.userId, userId), eq(dailyCheckEntries.date, date))
      );
  }

  async createEntries(
    userId: string,
    date: string,
    entries: SaveDailyCheckEntryDto[]
  ): Promise<DailyCheckEntryRow[]> {
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

  async getReportByUserAndDate(
    userId: string,
    date: string
  ): Promise<DailyReportRowDto | undefined> {
    const [row]: DailyReportRow[] = await db
      .select({
        id: dailyReports.id,
        date: dailyReports.date,
        moodScore: dailyReports.moodScore,
        moodComment: dailyReports.moodComment,
        summary: dailyReports.summary,
        note: dailyReports.note,
        musicOfDay: dailyReports.musicOfDay,
        status: dailyReports.status,
        deadlineAt: dailyReports.deadlineAt,
        closedAt: dailyReports.closedAt,
        completedAt: dailyReports.completedAt,
        wasEditedAfterDeadline: dailyReports.wasEditedAfterDeadline,
        timeZone: dailyReports.timeZone,
        createdAt: dailyReports.createdAt,
        updatedAt: dailyReports.updatedAt,
      })
      .from(dailyReports)
      .where(and(eq(dailyReports.userId, userId), eq(dailyReports.date, date)));

    return row ? this.mapReport(row) : undefined;
  }

  async upsertReport(
    userId: string,
    date: string,
    dto: UpsertDailyReportDto
  ): Promise<DailyReportRowDto> {
    const existing = await this.getReportByUserAndDate(userId, date);

    if (!existing) {
      const [created]: DailyReportRow[] = await db
        .insert(dailyReports)
        .values({
          userId,
          date,
          moodScore: dto.moodScore,
          moodComment: dto.moodComment,
          summary: dto.summary,
          note: dto.note,
          musicOfDay: dto.musicOfDay,
          status: dto.status,
          deadlineAt: dto.deadlineAt,
          closedAt: dto.closedAt,
          completedAt: dto.completedAt,
          wasEditedAfterDeadline: dto.wasEditedAfterDeadline,
          timeZone: dto.timeZone,
          updatedAt: new Date(),
        })
        .returning({
          id: dailyReports.id,
          date: dailyReports.date,
          moodScore: dailyReports.moodScore,
          moodComment: dailyReports.moodComment,
          summary: dailyReports.summary,
          note: dailyReports.note,
          musicOfDay: dailyReports.musicOfDay,
          status: dailyReports.status,
          deadlineAt: dailyReports.deadlineAt,
          closedAt: dailyReports.closedAt,
          completedAt: dailyReports.completedAt,
          wasEditedAfterDeadline: dailyReports.wasEditedAfterDeadline,
          timeZone: dailyReports.timeZone,
          createdAt: dailyReports.createdAt,
          updatedAt: dailyReports.updatedAt,
        });

      return this.mapReport(created);
    }

    const [updated]: DailyReportRow[] = await db
      .update(dailyReports)
      .set({
        moodScore: dto.moodScore,
        moodComment: dto.moodComment,
        summary: dto.summary,
        note: dto.note,
        musicOfDay: dto.musicOfDay,
        status: dto.status,
        deadlineAt: dto.deadlineAt,
        closedAt: dto.closedAt,
        completedAt: dto.completedAt,
        wasEditedAfterDeadline: dto.wasEditedAfterDeadline,
        timeZone: dto.timeZone,
        updatedAt: new Date(),
      })
      .where(eq(dailyReports.id, existing.id))
      .returning({
        id: dailyReports.id,
        date: dailyReports.date,
        moodScore: dailyReports.moodScore,
        moodComment: dailyReports.moodComment,
        summary: dailyReports.summary,
        note: dailyReports.note,
        musicOfDay: dailyReports.musicOfDay,
        status: dailyReports.status,
        deadlineAt: dailyReports.deadlineAt,
        closedAt: dailyReports.closedAt,
        completedAt: dailyReports.completedAt,
        wasEditedAfterDeadline: dailyReports.wasEditedAfterDeadline,
        timeZone: dailyReports.timeZone,
        createdAt: dailyReports.createdAt,
        updatedAt: dailyReports.updatedAt,
      });

    return this.mapReport(updated);
  }

  async getReportsInRange(
    userId: string,
    from: string,
    to: string
  ): Promise<DailyReportRowDto[]> {
    const rows: DailyReportRow[] = await db
      .select({
        id: dailyReports.id,
        date: dailyReports.date,
        moodScore: dailyReports.moodScore,
        moodComment: dailyReports.moodComment,
        summary: dailyReports.summary,
        note: dailyReports.note,
        musicOfDay: dailyReports.musicOfDay,
        status: dailyReports.status,
        deadlineAt: dailyReports.deadlineAt,
        closedAt: dailyReports.closedAt,
        completedAt: dailyReports.completedAt,
        wasEditedAfterDeadline: dailyReports.wasEditedAfterDeadline,
        timeZone: dailyReports.timeZone,
        createdAt: dailyReports.createdAt,
        updatedAt: dailyReports.updatedAt,
      })
      .from(dailyReports)
      .where(
        and(
          eq(dailyReports.userId, userId),
          gte(dailyReports.date, from),
          lte(dailyReports.date, to)
        )
      );

    return rows.map((row) => this.mapReport(row));
  }

  async getEntriesInRange(
    userId: string,
    from: string,
    to: string
  ): Promise<DailyCheckRangeEntryRow[]> {
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