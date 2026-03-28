export type DailyCheckAppliesMode = "every_day" | "selected_days";
export type DailyCheckStatus = "yes" | "no" | "skipped";

export interface DailyCheckItemDto {
  id: string;
  userId: string;
  title: string;
  emoji: string | null;
  appliesMode: DailyCheckAppliesMode;
  weekDays: number[];
  sortOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateDailyCheckItemDto {
  title: string;
  emoji?: string | null;
  appliesMode?: DailyCheckAppliesMode;
  weekDays?: number[];
  sortOrder?: number;
  isActive?: boolean;
}

export interface UpdateDailyCheckItemDto {
  title?: string;
  emoji?: string | null;
  appliesMode?: DailyCheckAppliesMode;
  weekDays?: number[];
  sortOrder?: number;
  isActive?: boolean;
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
  report?: SaveDailyReportDto;
  entries: SaveDailyCheckEntryDto[];
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
  items: Array<{
    id: string;
    title: string;
    emoji: string | null;
    appliesMode: DailyCheckAppliesMode;
    weekDays: number[];
    sortOrder: number;
    isActive: boolean;
    status: DailyCheckStatus | null;
    skipReason: string | null;
  }>;
}