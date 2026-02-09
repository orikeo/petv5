export interface CreateWeightDto {
  entryDate: string; // ISO date
  weight: number;
  note?: string;
}

export interface WeightQueryDto {
  page?: string;
  limit?: string;
  from?: string;
  to?: string;
}

export type WeightHistoryQueryDto = {
  page?: number;
  limit?: number;
};

export type WeightHistoryItem = {
  date: string;   // YYYY-MM-DD
  weight: number;
};