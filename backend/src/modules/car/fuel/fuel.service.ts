import { fuelRepository } from "./fuel.repository";
import { carRepository } from "../car.repository";
import {
  CreateFuelLogDto,
  UpdateFuelLogDto,
  FuelConsumptionStats,
  FuelStatsResponse,
} from "./fuel.types";

class FuelService {
  async create(userId: string, data: CreateFuelLogDto) {
    const car = await carRepository.findById(data.carId);

    if (!car) {
      throw new Error("Машина не найдена");
    }

    if (car.userId !== userId) {
      throw new Error("Нет доступа к этой машине");
    }

    this.validateFuelDate(data.fuelDate);
    this.validatePositiveNumber(data.liters, "Некорректное количество литров");
    this.validatePositiveNumber(
      data.pricePerLiter,
      "Некорректная цена за литр"
    );

    if (data.odometer !== null && data.odometer !== undefined) {
      this.validateNonNegativeInteger(data.odometer, "Некорректный пробег");

      const previousLog = await fuelRepository.getLastLogBeforeOrOnDate(
        data.carId,
        data.fuelDate
      );

      if (
        previousLog &&
        previousLog.odometer !== null &&
        data.odometer < previousLog.odometer
      ) {
        throw new Error(
          "Пробег не может быть меньше предыдущей записи на эту дату или раньше"
        );
      }
    }

    const totalPrice = Number((data.liters * data.pricePerLiter).toFixed(2));

    return fuelRepository.create({
      carId: data.carId,
      fuelDate: data.fuelDate,
      odometer: data.odometer ?? null,
      liters: data.liters,
      pricePerLiter: data.pricePerLiter,
      totalPrice,
      fullTank: data.fullTank ?? false,
      station: data.station ?? null,
    });
  }

  async getByCar(userId: string, carId: string) {
    const car = await carRepository.findById(carId);

    if (!car) {
      throw new Error("Машина не найдена");
    }

    if (car.userId !== userId) {
      throw new Error("Нет доступа к этой машине");
    }

    return fuelRepository.findByCar(carId);
  }

  async getStatsByCar(userId: string, carId: string): Promise<FuelStatsResponse> {
    const car = await carRepository.findById(carId);

    if (!car) {
      throw new Error("Машина не найдена");
    }

    if (car.userId !== userId) {
      throw new Error("Нет доступа к этой машине");
    }

    const logs = await fuelRepository.findByCar(carId);

    if (logs.length === 0) {
      return {
        summary: {
          totalLogs: 0,
          logsWithOdometer: 0,
          totalFullTankLogs: 0,
          totalLiters: 0,
          totalSpent: 0,
          averagePricePerLiter: 0,
          averageFillVolume: 0,
          lastFuelDate: null,
          lastOdometer: null,
        },
        consumption: null,
      };
    }

    const totalLogs = logs.length;
    const logsWithOdometer = logs.filter((log) => log.odometer !== null).length;
    const totalFullTankLogs = logs.filter((log) => log.fullTank).length;

    const totalLiters = logs.reduce((sum, log) => sum + Number(log.liters), 0);
    const totalSpent = logs.reduce((sum, log) => sum + Number(log.totalPrice), 0);

    const averagePricePerLiter =
      totalLiters > 0 ? Number((totalSpent / totalLiters).toFixed(2)) : 0;

    const averageFillVolume =
      totalLogs > 0 ? Number((totalLiters / totalLogs).toFixed(2)) : 0;

    const sortedAsc = [...logs].sort((a, b) => {
      const dateCompare = a.fuelDate.localeCompare(b.fuelDate);

      if (dateCompare !== 0) {
        return dateCompare;
      }

      return a.createdAt.getTime() - b.createdAt.getTime();
    });

    const latestByDate = [...logs].sort((a, b) => {
      const dateCompare = b.fuelDate.localeCompare(a.fuelDate);

      if (dateCompare !== 0) {
        return dateCompare;
      }

      return b.createdAt.getTime() - a.createdAt.getTime();
    })[0];

    const summary: FuelStatsResponse["summary"] = {
      totalLogs,
      logsWithOdometer,
      totalFullTankLogs,
      totalLiters: Number(totalLiters.toFixed(2)),
      totalSpent: Number(totalSpent.toFixed(2)),
      averagePricePerLiter,
      averageFillVolume,
      lastFuelDate: latestByDate?.fuelDate ?? null,
      lastOdometer: latestByDate?.odometer ?? null,
    };

    const consumption = this.calculateConsumptionStats(sortedAsc);

    return {
      summary,
      consumption,
    };
  }

  async delete(userId: string, id: string) {
    const log = await fuelRepository.getById(id);

    if (!log) {
      throw new Error("Запись о заправке не найдена");
    }

    const car = await carRepository.findById(log.carId);

    if (!car) {
      throw new Error("Машина не найдена");
    }

    if (car.userId !== userId) {
      throw new Error("Нет доступа к этой машине");
    }

    await fuelRepository.delete(id);
  }

  async update(userId: string, id: string, data: UpdateFuelLogDto) {
    const existingLog = await fuelRepository.getById(id);

    if (!existingLog) {
      throw new Error("Запись о заправке не найдена");
    }

    const car = await carRepository.findById(existingLog.carId);

    if (!car) {
      throw new Error("Машина не найдена");
    }

    if (car.userId !== userId) {
      throw new Error("Нет доступа к этой машине");
    }

    const fuelDate = data.fuelDate ?? existingLog.fuelDate;
    const odometer =
      data.odometer !== undefined ? data.odometer : existingLog.odometer;
    const liters = data.liters ?? Number(existingLog.liters);
    const pricePerLiter =
      data.pricePerLiter ?? Number(existingLog.pricePerLiter);
    const fullTank = data.fullTank ?? existingLog.fullTank;
    const station =
      data.station !== undefined ? data.station : existingLog.station;

    this.validateFuelDate(fuelDate);
    this.validatePositiveNumber(liters, "Некорректное количество литров");
    this.validatePositiveNumber(
      pricePerLiter,
      "Некорректная цена за литр"
    );

    if (odometer !== null && odometer !== undefined) {
      this.validateNonNegativeInteger(odometer, "Некорректный пробег");

      const previousLog = await fuelRepository.getLastLogBeforeOrOnDate(
        existingLog.carId,
        fuelDate,
        id
      );

      if (
        previousLog &&
        previousLog.odometer !== null &&
        odometer < previousLog.odometer
      ) {
        throw new Error(
          "Пробег не может быть меньше предыдущей записи на эту дату или раньше"
        );
      }
    }

    const totalPrice = Number((liters * pricePerLiter).toFixed(2));

    return fuelRepository.update(id, {
      fuelDate,
      odometer: odometer ?? null,
      liters,
      pricePerLiter,
      totalPrice,
      fullTank,
      station: station ?? null,
    });
  }

  private calculateConsumptionStats(
    logsAsc: Array<{
      fuelDate: string;
      odometer: number | null;
      liters: string;
      totalPrice: string;
      fullTank: boolean;
      createdAt: Date;
    }>
  ): FuelConsumptionStats | null {
    const fullTankLogs = logsAsc.filter(
      (log) => log.fullTank && log.odometer !== null
    );

    if (fullTankLogs.length < 2) {
      return null;
    }

    let totalDistanceKm = 0;
    let totalLiters = 0;
    let totalSpent = 0;
    let segmentCount = 0;

    let previousFullTankIndex: number | null = null;

    for (let i = 0; i < logsAsc.length; i += 1) {
      const current = logsAsc[i];

      if (!current.fullTank || current.odometer === null) {
        continue;
      }

      if (previousFullTankIndex === null) {
        previousFullTankIndex = i;
        continue;
      }

      const previousFull = logsAsc[previousFullTankIndex];

      if (previousFull.odometer === null || current.odometer === null) {
        previousFullTankIndex = i;
        continue;
      }

      const distance = current.odometer - previousFull.odometer;

      if (distance <= 0) {
        previousFullTankIndex = i;
        continue;
      }

      let segmentLiters = 0;
      let segmentSpent = 0;

      for (let j = previousFullTankIndex + 1; j <= i; j += 1) {
        segmentLiters += Number(logsAsc[j].liters);
        segmentSpent += Number(logsAsc[j].totalPrice);
      }

      if (segmentLiters <= 0) {
        previousFullTankIndex = i;
        continue;
      }

      totalDistanceKm += distance;
      totalLiters += segmentLiters;
      totalSpent += segmentSpent;
      segmentCount += 1;

      previousFullTankIndex = i;
    }

    if (segmentCount === 0 || totalDistanceKm <= 0 || totalLiters <= 0) {
      return null;
    }

    return {
      segmentCount,
      totalDistanceKm,
      totalLiters: Number(totalLiters.toFixed(2)),
      totalSpent: Number(totalSpent.toFixed(2)),
      averageConsumptionPer100Km: Number(
        ((totalLiters / totalDistanceKm) * 100).toFixed(2)
      ),
      averageCostPerKm: Number((totalSpent / totalDistanceKm).toFixed(2)),
      averageCostPer100Km: Number(
        ((totalSpent / totalDistanceKm) * 100).toFixed(2)
      ),
    };
  }

  private validateFuelDate(value: string) {
    const normalizedValue = value.trim();

    if (!normalizedValue) {
      throw new Error("Некорректная дата заправки");
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(normalizedValue)) {
      throw new Error("Некорректная дата заправки");
    }

    if (Number.isNaN(Date.parse(normalizedValue))) {
      throw new Error("Некорректная дата заправки");
    }
  }

  private validatePositiveNumber(value: number, errorMessage: string) {
    if (typeof value !== "number" || Number.isNaN(value) || value <= 0) {
      throw new Error(errorMessage);
    }
  }

  private validateNonNegativeInteger(value: number, errorMessage: string) {
    if (
      typeof value !== "number" ||
      Number.isNaN(value) ||
      !Number.isInteger(value) ||
      value < 0
    ) {
      throw new Error(errorMessage);
    }
  }
}

export const fuelService = new FuelService();