import { db } from "../../../db"
import { fuelLogs } from "../../../db/schema"
import { eq, desc } from "drizzle-orm"
import { CreateFuelLogDto } from './fuel.types';


class FuelRepository {

  async create(data: CreateFuelLogDto) {

    const [entry] = await db
      .insert(fuelLogs)
      .values({
        carId: data.carId,
        odometer: data.odometer,
        liters: data.liters.toString(),
        pricePerLiter: data.pricePerLiter?.toString() ?? null,
        totalPrice: data.totalPrice?.toString() ?? null,
        fullTank: data.fullTank ?? false,
        station: data.station ?? null
      })
      .returning()

    return entry
  }

  async findByCar(carId: string) {

    return db
      .select()
      .from(fuelLogs)
      .where(eq(fuelLogs.carId, carId))
      .orderBy(desc(fuelLogs.odometer))

  }

  async delete(id: string) {

    await db
      .delete(fuelLogs)
      .where(eq(fuelLogs.id, id))

  }

}

export const fuelRepository = new FuelRepository()