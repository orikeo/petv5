import { repairRepository } from "./repair.repository";
import { CreateRepairDto, UpdateRepairDto } from "./repair.types";

class RepairService {
  async createRepair(userId: string, data: CreateRepairDto) {
    const car = await repairRepository.getCarById(data.carId);

    if (!car) {
      throw new Error("Машина не найдена");
    }

    if (car.userId !== userId) {
      throw new Error("Нет доступа к этой машине");
    }

    const repairType = await repairRepository.getRepairTypeById(
      data.repairTypeId
    );

    if (!repairType) {
      throw new Error("Тип ремонта не найден");
    }

    const normalizedPrice = this.normalizePrice(data.price);
    const normalizedOdometer = this.normalizeOdometer(data.odometer);
    const normalizedNote = this.normalizeNote(data.note);

    return repairRepository.createRepair({
      carId: data.carId,
      repairTypeId: data.repairTypeId,
      price: normalizedPrice,
      odometer: normalizedOdometer,
      note: normalizedNote,
    });
  }

  async getRepairsByCarId(userId: string, carId: string) {
    const car = await repairRepository.getCarById(carId);

    if (!car) {
      throw new Error("Машина не найдена");
    }

    if (car.userId !== userId) {
      throw new Error("Нет доступа к этой машине");
    }

    return repairRepository.getRepairsByCarId(carId);
  }

  async getRepairById(userId: string, repairId: string) {
    const repair = await repairRepository.getRepairById(repairId);

    if (!repair) {
      throw new Error("Ремонт не найден");
    }

    const car = await repairRepository.getCarById(repair.carId);

    if (!car) {
      throw new Error("Машина не найдена");
    }

    if (car.userId !== userId) {
      throw new Error("Нет доступа к этому ремонту");
    }

    return repair;
  }

  async updateRepair(
    userId: string,
    repairId: string,
    data: UpdateRepairDto
  ) {
    const existingRepair = await repairRepository.getRepairById(repairId);

    if (!existingRepair) {
      throw new Error("Ремонт не найден");
    }

    const car = await repairRepository.getCarById(existingRepair.carId);

    if (!car) {
      throw new Error("Машина не найдена");
    }

    if (car.userId !== userId) {
      throw new Error("Нет доступа к этому ремонту");
    }

    if (data.repairTypeId !== undefined) {
      const repairType = await repairRepository.getRepairTypeById(
        data.repairTypeId
      );

      if (!repairType) {
        throw new Error("Тип ремонта не найден");
      }
    }

    const updateData: UpdateRepairDto = {};

    if (data.repairTypeId !== undefined) {
      updateData.repairTypeId = data.repairTypeId;
    }

    if (data.price !== undefined) {
      updateData.price = this.normalizePrice(data.price);
    }

    if (data.odometer !== undefined) {
      updateData.odometer = this.normalizeOdometer(data.odometer);
    }

    if (data.note !== undefined) {
      updateData.note = this.normalizeNote(data.note);
    }

    return repairRepository.updateRepair(repairId, updateData);
  }

  async deleteRepair(userId: string, repairId: string) {
    const existingRepair = await repairRepository.getRepairById(repairId);

    if (!existingRepair) {
      throw new Error("Ремонт не найден");
    }

    const car = await repairRepository.getCarById(existingRepair.carId);

    if (!car) {
      throw new Error("Машина не найдена");
    }

    if (car.userId !== userId) {
      throw new Error("Нет доступа к этому ремонту");
    }

    return repairRepository.deleteRepair(repairId);
  }

  async getRepairTypes() {
    return repairRepository.getRepairTypes();
  }

  async createRepairType(name: string) {
    const normalizedName = name.trim();

    if (!normalizedName) {
      throw new Error("Название типа ремонта обязательно");
    }

    const existingRepairType =
      await repairRepository.getRepairTypeByName(normalizedName);

    if (existingRepairType) {
      throw new Error("Такой тип ремонта уже существует");
    }

    return repairRepository.createRepairType(normalizedName);
  }

  private normalizePrice(price: string): string {
    const normalizedValue = price.replace(",", ".").trim();
    const priceNumber = Number(normalizedValue);

    if (Number.isNaN(priceNumber) || priceNumber <= 0) {
      throw new Error("Цена ремонта должна быть больше 0");
    }

    return priceNumber.toFixed(2);
  }

  private normalizeOdometer(odometer?: number | null): number | null {
    if (odometer === undefined || odometer === null) {
      return null;
    }

    if (!Number.isInteger(odometer) || odometer < 0) {
      throw new Error("Пробег должен быть целым числом и не меньше 0");
    }

    return odometer;
  }

  private normalizeNote(note?: string | null): string | null {
    if (note === undefined || note === null) {
      return null;
    }

    const normalizedNote = note.trim();

    return normalizedNote ? normalizedNote : null;
  }
}

export const repairService = new RepairService();