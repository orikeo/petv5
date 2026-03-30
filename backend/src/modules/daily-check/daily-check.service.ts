import { AppError } from "../../errors/app-error";
import { dailyCheckRepository, DailyCheckRangeEntryRow } from "./daily-check.repository";
import {
  addDaysToDateString,
  buildDailyReportDeadlineAt,
  getDateStringDayOfWeek,
  getTodayUtcDateString,
  isAfterDeadline,
  normalizeTimeZone,
} from "./daily-check.time";
import {
  CreateDailyCheckItemDto,
  DailyCheckItemDto,
  DailyCheckStatus,
  DailyDayResponseDto,
  DailyOverviewDayDto,
  DailyReportLifecycleDto,
  DailyReportLifecycleStatus,
  DailyReportRowDto,
  SaveDailyCheckEntryDto,
  SaveDayDto,
  UpdateDailyCheckItemDto,
  UpsertDailyReportDto,
} from "./daily-check.types";

class DailyCheckService {
  private readonly allowedStatuses: DailyCheckStatus[] = [
    "yes",
    "no",
    "skipped",
  ];

  private readonly allowedAppliesModes = [
    "every_day",
    "selected_days",
  ] as const;

  private normalizeDate(value: string) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      throw new AppError("Некорректная дата. Используй формат YYYY-MM-DD", 400);
    }

    return value;
  }

  private resolveEffectiveFrom(value?: string) {
    return value ? this.normalizeDate(value) : getTodayUtcDateString();
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
      throw new AppError(
        "Для selected_days нужно передать хотя бы один день недели",
        400
      );
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

  /**
   * Версионность по датам уже фильтруется в repository.
   * Здесь только weekly-логика.
   */
  private isItemApplicable(item: DailyCheckItemDto, date: string) {
    if (item.appliesMode === "every_day") {
      return true;
    }

    const dayOfWeek = getDateStringDayOfWeek(date);
    return item.weekDays.includes(dayOfWeek);
  }

  /**
   * Оставляем только записи, которые относятся к актуальным привычкам этой даты.
   *
   * Важно: helper generic, чтобы не терялись поля entry.status / entry.skipReason.
   */
  private filterEntriesForApplicableItems<T extends { itemId: string }>(
    entries: T[],
    applicableItems: DailyCheckItemDto[]
  ): T[] {
    const applicableIds = new Set(applicableItems.map((item) => item.id));
    return entries.filter((entry) => applicableIds.has(entry.itemId));
  }

  private hasMeaningfulText(value: string | null | undefined) {
    return Boolean(value?.trim());
  }

  private hasMeaningfulReportContent(
    report:
      | {
          moodScore: number | null;
          moodComment: string | null;
          summary: string | null;
          note: string | null;
          musicOfDay: string | null;
        }
      | DailyReportRowDto
      | null
      | undefined
  ) {
    if (!report) {
      return false;
    }

    return (
      report.moodScore !== null ||
      this.hasMeaningfulText(report.moodComment) ||
      this.hasMeaningfulText(report.summary) ||
      this.hasMeaningfulText(report.note) ||
      this.hasMeaningfulText(report.musicOfDay)
    );
  }

  private buildClosedStatus(params: {
    habitsTotal: number;
    answeredCount: number;
    hasReportContent: boolean;
  }): Exclude<DailyReportLifecycleStatus, "open"> {
    const { habitsTotal, answeredCount, hasReportContent } = params;

    if (habitsTotal === 0) {
      return hasReportContent ? "completed" : "missed";
    }

    if (answeredCount === 0 && !hasReportContent) {
      return "missed";
    }

    if (answeredCount === habitsTotal) {
      return "completed";
    }

    return "partial";
  }

  private mapReportToPayload(report: DailyReportRowDto): UpsertDailyReportDto {
    return {
      moodScore: report.moodScore,
      moodComment: report.moodComment,
      summary: report.summary,
      note: report.note,
      musicOfDay: report.musicOfDay,
      status: report.status,
      deadlineAt: report.deadlineAt,
      closedAt: report.closedAt,
      completedAt: report.completedAt,
      wasEditedAfterDeadline: report.wasEditedAfterDeadline,
      timeZone: report.timeZone,
    };
  }

  private mapLifecycle(
    report: DailyReportRowDto | undefined,
    fallback: DailyReportLifecycleDto
  ): DailyReportLifecycleDto {
    if (!report) {
      return fallback;
    }

    return {
      status: report.status,
      deadlineAt: report.deadlineAt?.toISOString() ?? fallback.deadlineAt,
      closedAt: report.closedAt?.toISOString() ?? null,
      completedAt: report.completedAt?.toISOString() ?? null,
      wasEditedAfterDeadline: report.wasEditedAfterDeadline,
      timeZone: report.timeZone,
      isOverdue: report.deadlineAt
        ? isAfterDeadline(report.deadlineAt)
        : fallback.isOverdue,
      canEdit: true,
    };
  }

  private async syncStoredReportLifecycle(params: {
    userId: string;
    date: string;
    habitsTotal: number;
    answeredCount: number;
    report: DailyReportRowDto | undefined;
    timeZone: string;
  }) {
    const { userId, date, habitsTotal, answeredCount, report, timeZone } =
      params;

    if (!report) {
      return undefined;
    }

    const effectiveTimeZone = report.timeZone || timeZone;
    const deadlineAt =
      report.deadlineAt ?? buildDailyReportDeadlineAt(date, effectiveTimeZone);

    if (report.status !== "open" || !isAfterDeadline(deadlineAt)) {
      return report;
    }

    const closedStatus = this.buildClosedStatus({
      habitsTotal,
      answeredCount,
      hasReportContent: this.hasMeaningfulReportContent(report),
    });

    return dailyCheckRepository.upsertReport(userId, date, {
      ...this.mapReportToPayload(report),
      status: closedStatus,
      deadlineAt,
      closedAt: new Date(),
      completedAt:
        this.hasMeaningfulReportContent(report) || answeredCount > 0
          ? report.completedAt ?? report.updatedAt
          : null,
      timeZone: effectiveTimeZone,
    });
  }

  private buildDerivedLifecycle(params: {
    date: string;
    timeZone: string;
    habitsTotal: number;
    answeredCount: number;
    report: DailyReportRowDto | undefined;
  }): DailyReportLifecycleDto {
    const { date, timeZone, habitsTotal, answeredCount, report } = params;

    const effectiveTimeZone = report?.timeZone || timeZone;
    const deadlineAt =
      report?.deadlineAt ?? buildDailyReportDeadlineAt(date, effectiveTimeZone);
    const overdue = isAfterDeadline(deadlineAt);

    if (report) {
      return this.mapLifecycle(report, {
        status: "open",
        deadlineAt: deadlineAt.toISOString(),
        closedAt: null,
        completedAt: null,
        wasEditedAfterDeadline: false,
        timeZone: effectiveTimeZone,
        isOverdue: overdue,
        canEdit: true,
      });
    }

    return {
      status: overdue
        ? this.buildClosedStatus({
            habitsTotal,
            answeredCount,
            hasReportContent: false,
          })
        : "open",
      deadlineAt: deadlineAt.toISOString(),
      closedAt: overdue ? deadlineAt.toISOString() : null,
      completedAt: null,
      wasEditedAfterDeadline: false,
      timeZone: effectiveTimeZone,
      isOverdue: overdue,
      canEdit: true,
    };
  }

  private async resolveDayState(
    userId: string,
    date: string,
    incomingTimeZone?: string
  ) {
    const normalizedDate = this.normalizeDate(date);
    const timeZone = normalizeTimeZone(incomingTimeZone);

    const [items, report, entries] = await Promise.all([
      dailyCheckRepository.getItemsByUserAndDate(userId, normalizedDate),
      dailyCheckRepository.getReportByUserAndDate(userId, normalizedDate),
      dailyCheckRepository.getEntriesByUserAndDate(userId, normalizedDate),
    ]);

    const applicableItems = items.filter((item: DailyCheckItemDto) =>
      this.isItemApplicable(item, normalizedDate)
    );

    const filteredEntries = this.filterEntriesForApplicableItems(
      entries,
      applicableItems
    );

    const answeredCount = filteredEntries.length;

    const syncedReport = await this.syncStoredReportLifecycle({
      userId,
      date: normalizedDate,
      habitsTotal: applicableItems.length,
      answeredCount,
      report,
      timeZone,
    });

    return {
      date: normalizedDate,
      timeZone,
      applicableItems,
      report: syncedReport ?? report,
      entries: filteredEntries,
    };
  }

  async getItems(userId: string) {
    return dailyCheckRepository.getItemsByUser(userId);
  }

  async createItem(userId: string, dto: CreateDailyCheckItemDto) {
    const appliesMode = this.resolveAppliesMode(dto.appliesMode);
    const effectiveFrom = this.resolveEffectiveFrom(dto.effectiveFrom);

    return dailyCheckRepository.createItem(userId, {
      title: this.normalizeTitle(dto.title),
      emoji: this.normalizeEmoji(dto.emoji),
      appliesMode,
      weekDays: this.normalizeWeekDays(dto.weekDays, appliesMode),
      sortOrder: dto.sortOrder ?? 0,
      effectiveFrom,
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

    if (existing.endDate !== null) {
      throw new AppError(
        "Нельзя изменять уже закрытую версию привычки",
        400
      );
    }

    const appliesMode = dto.appliesMode ?? existing.appliesMode;
    const effectiveFrom = this.resolveEffectiveFrom(dto.effectiveFrom);

    if (effectiveFrom < existing.startDate) {
      throw new AppError(
        "effectiveFrom не может быть раньше startDate текущей версии",
        400
      );
    }

    const updated = await dailyCheckRepository.updateItem(itemId, {
      title:
        dto.title !== undefined ? this.normalizeTitle(dto.title) : existing.title,
      emoji:
        dto.emoji !== undefined
          ? this.normalizeEmoji(dto.emoji) ?? null
          : existing.emoji,
      appliesMode,
      weekDays:
        dto.weekDays !== undefined || dto.appliesMode !== undefined
          ? this.normalizeWeekDays(dto.weekDays ?? existing.weekDays, appliesMode)
          : existing.weekDays,
      sortOrder: dto.sortOrder ?? existing.sortOrder,
      effectiveFrom,
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

    if (existing.endDate !== null) {
      return;
    }

    const effectiveFrom = getTodayUtcDateString();

    if (effectiveFrom < existing.startDate) {
      throw new AppError("Нельзя закрыть привычку раньше её startDate", 400);
    }

    await dailyCheckRepository.deleteItem(itemId, effectiveFrom);
  }

  async getDay(
    userId: string,
    date: string,
    incomingTimeZone?: string
  ): Promise<DailyDayResponseDto> {
    const state = await this.resolveDayState(userId, date, incomingTimeZone);

    const items = state.applicableItems.map((item: DailyCheckItemDto) => {
      const entry = state.entries.find((current) => current.itemId === item.id);

      return {
        id: item.id,
        title: item.title,
        emoji: item.emoji,
        appliesMode: item.appliesMode,
        weekDays: item.weekDays,
        sortOrder: item.sortOrder,
        status: entry?.status ?? null,
        skipReason: entry?.skipReason ?? null,
      };
    });

    const lifecycle = this.buildDerivedLifecycle({
      date: state.date,
      timeZone: state.timeZone,
      habitsTotal: state.applicableItems.length,
      answeredCount: state.entries.length,
      report: state.report,
    });

    return {
      date: state.date,
      report: state.report
        ? {
            moodScore: state.report.moodScore,
            moodComment: state.report.moodComment,
            summary: state.report.summary,
            note: state.report.note,
            musicOfDay: state.report.musicOfDay,
          }
        : null,
      lifecycle,
      items,
    };
  }

  async saveDay(userId: string, dto: SaveDayDto) {
    const normalizedDate = this.normalizeDate(dto.date);
    const timeZone = normalizeTimeZone(dto.timeZone);

    if (!Array.isArray(dto.entries)) {
      throw new AppError("entries должен быть массивом", 400);
    }

    const items = await dailyCheckRepository.getItemsByUserAndDate(
      userId,
      normalizedDate
    );

    const applicableItems = items.filter((item: DailyCheckItemDto) =>
      this.isItemApplicable(item, normalizedDate)
    );

    const applicableItemIds = new Set(applicableItems.map((item) => item.id));

    for (const entry of dto.entries) {
      if (!applicableItemIds.has(entry.itemId)) {
        throw new AppError(
          `Привычка ${entry.itemId} недоступна для этой даты`,
          400
        );
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
      throw new AppError(
        "Одна привычка не может повторяться несколько раз в одном дне",
        400
      );
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

    const normalizedEntries: SaveDailyCheckEntryDto[] = dto.entries.map(
      (entry) => ({
        itemId: entry.itemId,
        status: entry.status,
        skipReason:
          entry.status === "skipped" ? entry.skipReason?.trim() ?? null : null,
      })
    );

    const normalizedReport = {
      moodScore: dto.report?.moodScore ?? null,
      moodComment: dto.report?.moodComment?.trim() || null,
      summary: dto.report?.summary?.trim() || null,
      note: dto.report?.note?.trim() || null,
      musicOfDay: dto.report?.musicOfDay?.trim() || null,
    };

    const existingReport = await dailyCheckRepository.getReportByUserAndDate(
      userId,
      normalizedDate
    );

    const deadlineAt =
      existingReport?.deadlineAt ??
      buildDailyReportDeadlineAt(normalizedDate, timeZone);

    const now = new Date();
    const overdue = isAfterDeadline(deadlineAt, now);
    const hasReportContent = this.hasMeaningfulReportContent(normalizedReport);

    const nextStatus: DailyReportLifecycleStatus = overdue
      ? this.buildClosedStatus({
          habitsTotal: applicableItems.length,
          answeredCount: normalizedEntries.length,
          hasReportContent,
        })
      : "open";

    await dailyCheckRepository.deleteEntriesByUserAndDate(userId, normalizedDate);
    await dailyCheckRepository.createEntries(
      userId,
      normalizedDate,
      normalizedEntries
    );

    await dailyCheckRepository.upsertReport(userId, normalizedDate, {
      ...normalizedReport,
      status: nextStatus,
      deadlineAt,
      closedAt: overdue ? now : null,
      completedAt: hasReportContent || normalizedEntries.length > 0 ? now : null,
      wasEditedAfterDeadline:
        overdue || existingReport?.wasEditedAfterDeadline || false,
      timeZone,
    });

    return this.getDay(userId, normalizedDate, timeZone);
  }

  async getRange(
    userId: string,
    from: string,
    to: string,
    incomingTimeZone?: string
  ) {
    const normalizedFrom = this.normalizeDate(from);
    const normalizedTo = this.normalizeDate(to);
    const timeZone = normalizeTimeZone(incomingTimeZone);

    const [items, reports, entries] = await Promise.all([
      dailyCheckRepository.getItemsByUserInRange(
        userId,
        normalizedFrom,
        normalizedTo
      ),
      dailyCheckRepository.getReportsInRange(userId, normalizedFrom, normalizedTo),
      dailyCheckRepository.getEntriesInRange(userId, normalizedFrom, normalizedTo),
    ]);

    const syncedReportsMap = new Map<string, DailyReportRowDto>();

    for (const report of reports) {
      const dayEntries = entries.filter(
        (entry: DailyCheckRangeEntryRow) => entry.date === report.date
      );

      const applicableItems = items.filter(
        (item: DailyCheckItemDto) =>
          item.startDate <= report.date &&
          (item.endDate === null || item.endDate > report.date) &&
          this.isItemApplicable(item, report.date)
      );

      const filteredDayEntries = this.filterEntriesForApplicableItems(
        dayEntries,
        applicableItems
      );

      const synced = await this.syncStoredReportLifecycle({
        userId,
        date: report.date,
        habitsTotal: applicableItems.length,
        answeredCount: filteredDayEntries.length,
        report,
        timeZone,
      });

      syncedReportsMap.set(report.date, synced ?? report);
    }

    const dates: string[] = [];
    let cursor = normalizedFrom;

    while (cursor <= normalizedTo) {
      dates.push(cursor);
      cursor = addDaysToDateString(cursor, 1);
    }

    return dates.map((date) => {
      const applicableItems = items.filter(
        (item: DailyCheckItemDto) =>
          item.startDate <= date &&
          (item.endDate === null || item.endDate > date) &&
          this.isItemApplicable(item, date)
      );

      const dayEntries = entries.filter(
        (entry: DailyCheckRangeEntryRow) => entry.date === date
      );

      const filteredDayEntries = this.filterEntriesForApplicableItems(
        dayEntries,
        applicableItems
      );

      const report = syncedReportsMap.get(date);

      const habitsTotal = applicableItems.length;
      const yesCount = filteredDayEntries.filter(
        (entry) => entry.status === "yes"
      ).length;
      const noCount = filteredDayEntries.filter(
        (entry) => entry.status === "no"
      ).length;
      const skippedCount = filteredDayEntries.filter(
        (entry) => entry.status === "skipped"
      ).length;

      const effectiveTotal = yesCount + noCount;
      const completionRate = effectiveTotal > 0 ? yesCount / effectiveTotal : 0;
      const skipRatio = habitsTotal > 0 ? skippedCount / habitsTotal : 0;
      const finalScore = Number(
        (completionRate * (1 - skipRatio * 0.5)).toFixed(4)
      );

      const lifecycle = this.buildDerivedLifecycle({
        date,
        timeZone,
        habitsTotal,
        answeredCount: filteredDayEntries.length,
        report,
      });

      const result: DailyOverviewDayDto = {
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
        status: lifecycle.status,
        deadlineAt: lifecycle.deadlineAt,
        closedAt: lifecycle.closedAt,
        wasEditedAfterDeadline: lifecycle.wasEditedAfterDeadline,
        timeZone: lifecycle.timeZone,
        isOverdue: lifecycle.isOverdue,
        canEdit: lifecycle.canEdit,
      };

      return result;
    });
  }
}

export const dailyCheckService = new DailyCheckService();