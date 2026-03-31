export interface CreateFuelLogDto {
  carId: string;
  fuelDate: string;
  odometer?: number | null;
  liters: number;
  pricePerLiter: number;
  fullTank?: boolean;
  station?: string | null;
}

export interface UpdateFuelLogDto {
  fuelDate?: string;
  odometer?: number | null;
  liters?: number;
  pricePerLiter?: number;
  fullTank?: boolean;
  station?: string | null;
}

export type FuelLog = {
  id: string;
  carId: string;
  fuelDate: string;
  odometer: number | null;
  liters: string;
  pricePerLiter: string;
  totalPrice: string;
  fullTank: boolean;
  station: string | null;
  createdAt: string;
};

export type FuelStatsSummary = {
  totalLogs: number;
  logsWithOdometer: number;
  totalFullTankLogs: number;
  totalLiters: number;
  totalSpent: number;
  averagePricePerLiter: number;
  averageFillVolume: number;
  lastFuelDate: string | null;
  lastOdometer: number | null;
};

export type FuelConsumptionStats = {
  segmentCount: number;
  totalDistanceKm: number;
  totalLiters: number;
  totalSpent: number;
  averageConsumptionPer100Km: number;
  averageCostPerKm: number;
  averageCostPer100Km: number;
};

export type FuelStatsResponse = {
  summary: FuelStatsSummary;
  consumption: FuelConsumptionStats | null;
};