import { AppError } from "../../errors/app-error";
import { dailyCheckRepository } from "./daily-check.repository";
import {
  CreateDailyCheckItemDto,
  DailyCheckItemDto,
  DailyCheckStatus,
  SaveDayDto,
  UpdateDailyCheckItemDto,
} from "./daily-check.types";

class DailyCheckService {
  private readonly allowedStatuses: DailyCheckStatus[] = ["yes", "no", "skipped"];
  private readonly allowedAppliesModes = ["every_day", "selected_days"] as const;

  private normalizeDate(value: string) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      throw new AppError("Некорректная дата. Используй формат YYYY-MM-DD", 400);
    }

    return value;
  }

  private normalizeTitle(value: string) {
    const normalized = value.trim();

    if (!normalized) {
      throw new AppError("Название привычки обязательно", 400);
    }

    return normalized;
  }

  private normalizeEmoji(value?: string | null) {
    if (value === undefined) {
      return undefined;
    }

    const normalized = value?.trim() ?? null;
    return normalized || null;
  }

  private normalizeWeekDays(
    value: number[] | undefined,
    appliesMode: "every_day" | "selected_days"
  ) {
    if (appliesMode === "every_day") {
      return [1, 2, 3, 4, 5, 6, 7];
    }

    const incoming = value ?? [];
    const uniqueSorted = [...new Set(incoming)]
      .filter((item) => Number.isInteger(item) && item >= 1 && item <= 7)
      .sort((a, b) => a - b);

    if (uniqueSorted.length === 0) {
      throw new AppError("Для selected_days нужно передать хотя бы один день недели", 400);
    }

    return uniqueSorted;
  }

  private resolveAppliesMode(value?: "every_day" | "selected_days") {
    const appliesMode = value ?? "every_day";

    if (!this.allowedAppliesModes.includes(appliesMode)) {
      throw new AppError("Некорректный appliesMode", 400);
    }

    return appliesMode;
  }

  private getDayOfWeek(date: string) {
    const jsDay = new Date(`${date}T00:00:00`).getDay();
    return jsDay === 0 ? 7 : jsDay;
  }

  private isItemApplicable(item: DailyCheckItemDto, date: string) {
    if (!item.isActive) {
      return false;
    }

    if (item.appliesMode === "every_day") {
      return true;
    }

    const dayOfWeek = this.getDayOfWeek(date);
    return item.weekDays.includes(dayOfWeek);
  }

  async getItems(userId: string) {
    return dailyCheckRepository.getItemsByUser(userId);
  }

  async createItem(userId: string, dto: CreateDailyCheckItemDto) {
    const appliesMode = this.resolveAppliesMode(dto.appliesMode);

    return dailyCheckRepository.createItem(userId, {
      title: this.normalizeTitle(dto.title),
      emoji: this.normalizeEmoji(dto.emoji),
      appliesMode,
      weekDays: this.normalizeWeekDays(dto.weekDays, appliesMode),
      sortOrder: dto.sortOrder ?? 0,
      isActive: dto.isActive ?? true,
    });
  }

  async updateItem(userId: string, itemId: string, dto: UpdateDailyCheckItemDto) {
    const existing = await dailyCheckRepository.getItemById(itemId);

    if (!existing) {
      throw new AppError("Привычка не найдена", 404);
    }

    if (existing.userId !== userId) {
      throw new AppError("Нет доступа к этой привычке", 403);
    }

    const appliesMode = dto.appliesMode ?? existing.appliesMode;

    const updated = await dailyCheckRepository.updateItem(itemId, {
      title: dto.title !== undefined ? this.normalizeTitle(dto.title) : undefined,
      emoji: this.normalizeEmoji(dto.emoji),
      appliesMode,
      weekDays:
        dto.weekDays !== undefined || dto.appliesMode !== undefined
          ? this.normalizeWeekDays(dto.weekDays ?? existing.weekDays, appliesMode)
          : undefined,
      sortOrder: dto.sortOrder,
      isActive: dto.isActive,
    });

    if (!updated) {
      throw new AppError("Не удалось обновить привычку", 500);
    }

    return updated;
  }

  async deleteItem(userId: string, itemId: string) {
    const existing = await dailyCheckRepository.getItemById(itemId);

    if (!existing) {
      throw new AppError("Привычка не найдена", 404);
    }

    if (existing.userId !== userId) {
      throw new AppError("Нет доступа к этой привычке", 403);
    }

    await dailyCheckRepository.deleteItem(itemId);
  }

  async getDay(userId: string, date: string) {
    const normalizedDate = this.normalizeDate(date);

    const [items, report, entries] = await Promise.all([
      dailyCheckRepository.getItemsByUser(userId),
      dailyCheckRepository.getReportByUserAndDate(userId, normalizedDate),
      dailyCheckRepository.getEntriesByUserAndDate(userId, normalizedDate),
    ]);

    const applicableItems = items
      .filter((item) => this.isItemApplicable(item, normalizedDate))
      .map((item) => {
        const entry = entries.find((current) => current.itemId === item.id);

        return {
          id: item.id,
          title: item.title,
          emoji: item.emoji,
          appliesMode: item.appliesMode,
          weekDays: item.weekDays,
          sortOrder: item.sortOrder,
          isActive: item.isActive,
          status: entry?.status ?? null,
          skipReason: entry?.skipReason ?? null,
        };
      });

    return {
      date: normalizedDate,
      report: report
        ? {
            moodScore: report.moodScore,
            moodComment: report.moodComment,
            summary: report.summary,
            note: report.note,
            musicOfDay: report.musicOfDay,
          }
        : null,
      items: applicableItems,
    };
  }

  async saveDay(userId: string, dto: SaveDayDto) {
    const normalizedDate = this.normalizeDate(dto.date);

    if (!Array.isArray(dto.entries)) {
      throw new AppError("entries должен быть массивом", 400);
    }

    const items = await dailyCheckRepository.getItemsByUser(userId);
    const applicableItems = items.filter((item) => this.isItemApplicable(item, normalizedDate));
    const applicableItemIds = new Set(applicableItems.map((item) => item.id));

    for (const entry of dto.entries) {
      if (!applicableItemIds.has(entry.itemId)) {
        throw new AppError(`Привычка ${entry.itemId} недоступна для этой даты`, 400);
      }

      if (!this.allowedStatuses.includes(entry.status)) {
        throw new AppError("Некорректный статус привычки", 400);
      }

      if (entry.status === "skipped") {
        const reason = entry.skipReason?.trim();

        if (!reason) {
          throw new AppError("Для skipped нужно указать причину", 400);
        }
      }
    }

    const uniqueEntryIds = new Set(dto.entries.map((entry) => entry.itemId));

    if (uniqueEntryIds.size !== dto.entries.length) {
      throw new AppError("Одна привычка не может повторяться несколько раз в одном дне", 400);
    }

    if (dto.report?.moodScore !== undefined && dto.report?.moodScore !== null) {
      if (
        !Number.isInteger(dto.report.moodScore) ||
        dto.report.moodScore < 1 ||
        dto.report.moodScore > 10
      ) {
        throw new AppError("moodScore должен быть целым числом от 1 до 10", 400);
      }
    }

    await dailyCheckRepository.deleteEntriesByUserAndDate(userId, normalizedDate);

    await dailyCheckRepository.createEntries(
      userId,
      normalizedDate,
      dto.entries.map((entry) => ({
        itemId: entry.itemId,
        status: entry.status,
        skipReason: entry.status === "skipped" ? entry.skipReason?.trim() ?? null : null,
      }))
    );

    if (dto.report) {
      await dailyCheckRepository.upsertReport(userId, normalizedDate, {
        moodScore: dto.report.moodScore ?? null,
        moodComment: dto.report.moodComment?.trim() || null,
        summary: dto.report.summary?.trim() || null,
        note: dto.report.note?.trim() || null,
        musicOfDay: dto.report.musicOfDay?.trim() || null,
      });
    }

    return this.getDay(userId, normalizedDate);
  }

  async getRange(userId: string, from: string, to: string) {
    const normalizedFrom = this.normalizeDate(from);
    const normalizedTo = this.normalizeDate(to);

    const [items, reports, entries] = await Promise.all([
      dailyCheckRepository.getItemsByUser(userId),
      dailyCheckRepository.getReportsInRange(userId, normalizedFrom, normalizedTo),
      dailyCheckRepository.getEntriesInRange(userId, normalizedFrom, normalizedTo),
    ]);

    const dates: string[] = [];
    const cursor = new Date(`${normalizedFrom}T00:00:00`);
    const end = new Date(`${normalizedTo}T00:00:00`);

    while (cursor <= end) {
      dates.push(cursor.toISOString().slice(0, 10));
      cursor.setDate(cursor.getDate() + 1);
    }

    return dates.map((date) => {
      const applicableItems = items.filter((item) => this.isItemApplicable(item, date));
      const dayEntries = entries.filter((entry) => entry.date === date);
      const report = reports.find((current) => current.date === date);

      const habitsTotal = applicableItems.length;
      const yesCount = dayEntries.filter((entry) => entry.status === "yes").length;
      const noCount = dayEntries.filter((entry) => entry.status === "no").length;
      const skippedCount = dayEntries.filter((entry) => entry.status === "skipped").length;

      const effectiveTotal = yesCount + noCount;
      const completionRate = effectiveTotal > 0 ? yesCount / effectiveTotal : 0;
      const skipRatio = habitsTotal > 0 ? skippedCount / habitsTotal : 0;

      const finalScore = Number((completionRate * (1 - skipRatio * 0.5)).toFixed(4));

      return {
        date,
        moodScore: report?.moodScore ?? null,
        summary: report?.summary ?? null,
        note: report?.note ?? null,
        habitsTotal,
        yesCount,
        noCount,
        skippedCount,
        completionRate: Number(completionRate.toFixed(4)),
        finalScore,
      };
    });
  }
}

export const dailyCheckService = new DailyCheckService();