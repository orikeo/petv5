export interface CreateFuelLogDto {
  carId: string;
  fuelDate: string; // YYYY-MM-DD
  odometer?: number | null;
  liters: number;
  pricePerLiter: number;
  fullTank?: boolean;
  station?: string | null;
}

export type FuelLog = {
  id: string
  carId: string
  odometer: number
  liters: number
  pricePerLiter: string | null
  totalPrice: string | null
  fullTank: boolean
  station: string | null
  createdAt: string
}