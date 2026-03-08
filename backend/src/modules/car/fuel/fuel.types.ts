export type CreateFuelLogDto = {
  carId: string
  odometer: number
  liters: number
  pricePerLiter?: number | null
  totalPrice?: number | null
  fullTank?: boolean
  station?: string | null
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