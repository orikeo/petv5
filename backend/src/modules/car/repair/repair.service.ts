import { repairRepository } from "./repair.repository";
import {
  CreateRepairDto,
  UpdateRepairDto,
} from "./repair.types";

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

    return repairRepository.createRepair(data);
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

    return repairRepository.updateRepair(repairId, data);
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
}

export const repairService = new RepairService();