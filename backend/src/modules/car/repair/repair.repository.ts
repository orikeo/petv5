import { asc, desc, eq } from "drizzle-orm";
import { db } from "../../../db";
import { cars, repairs, repairTypes } from "../../../db/schema";
import { CreateRepairDto, UpdateRepairDto } from "./repair.types";

class RepairRepository {
  async getCarById(carId: string) {
    const [car] = await db
      .select({
        id: cars.id,
        userId: cars.userId,
      })
      .from(cars)
      .where(eq(cars.id, carId));

    return car;
  }

  async getRepairTypeById(repairTypeId: string) {
    const [repairType] = await db
      .select({
        id: repairTypes.id,
        name: repairTypes.name,
      })
      .from(repairTypes)
      .where(eq(repairTypes.id, repairTypeId));

    return repairType;
  }

  async getRepairTypeByName(name: string) {
    const [repairType] = await db
      .select({
        id: repairTypes.id,
        name: repairTypes.name,
      })
      .from(repairTypes)
      .where(eq(repairTypes.name, name));

    return repairType;
  }

  async getRepairTypes() {
    return db
      .select({
        id: repairTypes.id,
        name: repairTypes.name,
      })
      .from(repairTypes)
      .orderBy(asc(repairTypes.name));
  }

  async createRepairType(name: string) {
    const [repairType] = await db
      .insert(repairTypes)
      .values({ name })
      .returning({
        id: repairTypes.id,
        name: repairTypes.name,
      });

    return repairType;
  }

  async createRepair(data: CreateRepairDto) {
    const [repair] = await db
      .insert(repairs)
      .values({
        carId: data.carId,
        repairTypeId: data.repairTypeId,
        repairDate: data.repairDate,
        odometer: data.odometer ?? null,
        price: data.price,
        note: data.note ?? null,
      })
      .returning({
        id: repairs.id,
        carId: repairs.carId,
        repairTypeId: repairs.repairTypeId,
        repairDate: repairs.repairDate,
        odometer: repairs.odometer,
        price: repairs.price,
        note: repairs.note,
        createdAt: repairs.createdAt,
      });

    return repair;
  }

  async getRepairById(repairId: string) {
    const [repair] = await db
      .select({
        id: repairs.id,
        carId: repairs.carId,
        repairTypeId: repairs.repairTypeId,
        repairDate: repairs.repairDate,
        odometer: repairs.odometer,
        price: repairs.price,
        note: repairs.note,
        createdAt: repairs.createdAt,
        repairTypeName: repairTypes.name,
      })
      .from(repairs)
      .leftJoin(repairTypes, eq(repairs.repairTypeId, repairTypes.id))
      .where(eq(repairs.id, repairId));

    return repair;
  }

  async getRepairsByCarId(carId: string) {
    return db
      .select({
        id: repairs.id,
        carId: repairs.carId,
        repairTypeId: repairs.repairTypeId,
        repairDate: repairs.repairDate,
        odometer: repairs.odometer,
        price: repairs.price,
        note: repairs.note,
        createdAt: repairs.createdAt,
        repairTypeName: repairTypes.name,
      })
      .from(repairs)
      .leftJoin(repairTypes, eq(repairs.repairTypeId, repairTypes.id))
      .where(eq(repairs.carId, carId))
      .orderBy(desc(repairs.repairDate), desc(repairs.createdAt));
  }

  async updateRepair(repairId: string, data: UpdateRepairDto) {
    const updateData: Partial<{
      repairTypeId: string;
      repairDate: string;
      odometer: number | null;
      price: string;
      note: string | null;
    }> = {};

    if (data.repairTypeId !== undefined) {
      updateData.repairTypeId = data.repairTypeId;
    }

    if (data.repairDate !== undefined) {
      updateData.repairDate = data.repairDate;
    }

    if (data.odometer !== undefined) {
      updateData.odometer = data.odometer;
    }

    if (data.price !== undefined) {
      updateData.price = data.price;
    }

    if (data.note !== undefined) {
      updateData.note = data.note;
    }

    const [repair] = await db
      .update(repairs)
      .set(updateData)
      .where(eq(repairs.id, repairId))
      .returning({
        id: repairs.id,
        carId: repairs.carId,
        repairTypeId: repairs.repairTypeId,
        repairDate: repairs.repairDate,
        odometer: repairs.odometer,
        price: repairs.price,
        note: repairs.note,
        createdAt: repairs.createdAt,
      });

    return repair;
  }

  async deleteRepair(repairId: string) {
    const [repair] = await db
      .delete(repairs)
      .where(eq(repairs.id, repairId))
      .returning({
        id: repairs.id,
      });

    return repair;
  }
}

export const repairRepository = new RepairRepository();