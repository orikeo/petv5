export type DailyCheckAppliesMode = "every_day" | "selected_days";
export type DailyCheckStatus = "yes" | "no" | "skipped";

export type DailyReportLifecycleStatus =
  | "open"
  | "completed"
  | "partial"
  | "missed";

export interface DailyCheckItemDto {
  id: string;
  userId: string;
  title: string;
  emoji: string | null;
  appliesMode: DailyCheckAppliesMode;
  weekDays: number[];
  sortOrder: number;
  startDate: string;
  endDate: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateDailyCheckItemDto {
  title: string;
  emoji?: string | null;
  appliesMode?: DailyCheckAppliesMode;
  weekDays?: number[];
  sortOrder?: number;

  /**
   * С какой даты привычка начинает действовать.
   * Если не передать — backend подставит текущую UTC дату.
   */
  effectiveFrom?: string;
}

export interface UpdateDailyCheckItemDto {
  title?: string;
  emoji?: string | null;
  appliesMode?: DailyCheckAppliesMode;
  weekDays?: number[];
  sortOrder?: number;

  /**
   * С какой даты включается новая версия привычки.
   * Если не передать — backend подставит текущую UTC дату.
   */
  effectiveFrom?: string;
}

export interface SaveDailyCheckEntryDto {
  itemId: string;
  status: DailyCheckStatus;
  skipReason?: string | null;
}

export interface SaveDailyReportDto {
  moodScore?: number | null;
  moodComment?: string | null;
  summary?: string | null;
  note?: string | null;
  musicOfDay?: string | null;
}

export interface SaveDayDto {
  date: string;

  /**
   * Таймзона устройства пользователя.
   * Пример:
   * Europe/Kyiv
   */
  timeZone?: string;

  report?: SaveDailyReportDto;
  entries: SaveDailyCheckEntryDto[];
}

export interface DailyReportLifecycleDto {
  status: DailyReportLifecycleStatus;
  deadlineAt: string;
  closedAt: string | null;
  completedAt: string | null;
  wasEditedAfterDeadline: boolean;
  timeZone: string;
  isOverdue: boolean;
  canEdit: boolean;
}

export interface DailyOverviewDayDto {
  date: string;
  moodScore: number | null;
  summary: string | null;
  note: string | null;

  habitsTotal: number;
  yesCount: number;
  noCount: number;
  skippedCount: number;

  completionRate: number;
  finalScore: number;

  status: DailyReportLifecycleStatus;
  deadlineAt: string;
  closedAt: string | null;
  wasEditedAfterDeadline: boolean;
  timeZone: string;
  isOverdue: boolean;
  canEdit: boolean;
}

export interface DailyDayResponseDto {
  date: string;

  report: {
    moodScore: number | null;
    moodComment: string | null;
    summary: string | null;
    note: string | null;
    musicOfDay: string | null;
  } | null;

  lifecycle: DailyReportLifecycleDto;

  items: Array<{
    id: string;
    title: string;
    emoji: string | null;
    appliesMode: DailyCheckAppliesMode;
    weekDays: number[];
    sortOrder: number;
    status: DailyCheckStatus | null;
    skipReason: string | null;
  }>;
}

export interface DailyReportRowDto {
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
}

export interface UpsertDailyReportDto {
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
}