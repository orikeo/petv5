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