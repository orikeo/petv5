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

  async getByCar(carId: string) {

    return fuelRepository.findByCar(carId)

  }

  async delete(id: string) {

    return fuelRepository.delete(id)

  }

}

export const fuelService = new FuelService()