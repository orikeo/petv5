import { fuelRepository } from "./fuel.repository"
import { CreateFuelLogDto } from "./fuel.types"

class FuelService {

  async create(dto: CreateFuelLogDto) {

    return fuelRepository.create({
      carId: dto.carId,
      odometer: dto.odometer,
      liters: dto.liters,
      pricePerLiter: dto.pricePerLiter ?? null,
      totalPrice: dto.totalPrice ?? null,
      fullTank: dto.fullTank ?? false,
      station: dto.station ?? null
    })

  }

  async getStats(carId: string) {

  const logs = await fuelRepository.findByCarOrdered(carId)

  if (logs.length < 2) {
    return null
  }

  let lastFullTank = null
  let fuelSum = 0

  for (const log of logs) {

    if (log.fullTank) {

      if (lastFullTank) {

        const distance = log.odometer - lastFullTank.odometer

        const consumption =
          (fuelSum / distance) * 100

        return {
          averageConsumption: Number(consumption.toFixed(2)),
          totalDistance: distance,
          totalFuel: fuelSum
        }

      }

      lastFullTank = log
      fuelSum = 0

    } else {

      fuelSum += Number(log.liters)

    }

  }

  return null
}

  async getByCar(carId: string) {

    return fuelRepository.findByCar(carId)

  }

  async delete(id: string) {

    return fuelRepository.delete(id)

  }



}

export const fuelService = new FuelService()