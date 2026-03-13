export interface CreateRepairDto {
  carId: string;
  repairTypeId: string;
  odometer?: number | null;
  price: string;
  note?: string | null;
}

export interface UpdateRepairDto {
  repairTypeId?: string;
  odometer?: number | null;
  price?: string;
  note?: string | null;
}

export interface CreateRepairTypeDto {
  name: string;
}