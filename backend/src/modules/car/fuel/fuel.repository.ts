import { and, desc, eq, isNotNull, lte, ne } from "drizzle-orm";
import { db } from "../../../db";
import { fuelLogs } from "../../../db/schema";
import { CreateFuelLogDto, UpdateFuelLogDto } from "./fuel.types";

/**
 * Отдельный тип для create/update после того,
 * как service уже посчитал totalPrice.
 *
 * Почему не используем DTO напрямую:
 * - DTO приходит "снаружи"
 * - repository работает уже с подготовленными данными
 * - здесь totalPrice уже обязателен и посчитан
 */
type FuelLogDbInput = {
  carId: string;
  fuelDate: string;
  odometer: number | null;
  liters: number;
  pricePerLiter: number;
  totalPrice: number;
  fullTank: boolean;
  station: string | null;
};

class FuelRepository {
  /**
   * =========================================================
   * CREATE
   * =========================================================
   *
   * Repository не валидирует бизнес-логику.
   * Он просто сохраняет уже подготовленные данные.
   */
  async create(data: FuelLogDbInput) {
    const [entry] = await db
      .insert(fuelLogs)
      .values({
        carId: data.carId,
        fuelDate: data.fuelDate,
        odometer: data.odometer,
        liters: data.liters.toString(),
        pricePerLiter: data.pricePerLiter.toString(),
        totalPrice: data.totalPrice.toString(),
        fullTank: data.fullTank,
        station: data.station,
      })
      .returning({
        id: fuelLogs.id,
        carId: fuelLogs.carId,
        fuelDate: fuelLogs.fuelDate,
        odometer: fuelLogs.odometer,
        liters: fuelLogs.liters,
        pricePerLiter: fuelLogs.pricePerLiter,
        totalPrice: fuelLogs.totalPrice,
        fullTank: fuelLogs.fullTank,
        station: fuelLogs.station,
        createdAt: fuelLogs.createdAt,
      });

    return entry;
  }

  /**
   * =========================================================
   * GET BY ID
   * =========================================================
   *
   * Нужен для:
   * - update
   * - delete
   * - проверки доступа через carId
   */
  async getById(id: string) {
    const [entry] = await db
      .select({
        id: fuelLogs.id,
        carId: fuelLogs.carId,
        fuelDate: fuelLogs.fuelDate,
        odometer: fuelLogs.odometer,
        liters: fuelLogs.liters,
        pricePerLiter: fuelLogs.pricePerLiter,
        totalPrice: fuelLogs.totalPrice,
        fullTank: fuelLogs.fullTank,
        station: fuelLogs.station,
        createdAt: fuelLogs.createdAt,
      })
      .from(fuelLogs)
      .where(eq(fuelLogs.id, id));

    return entry;
  }

  /**
   * =========================================================
   * FIND BY CAR
   * =========================================================
   *
   * Список логов машины.
   *
   * Логичнее сортировать:
   * 1) сначала по fuelDate (новые сверху)
   * 2) а не по odometer
   *
   * Потому что пользователь обычно смотрит историю по датам.
   */
  async findByCar(carId: string) {
    return db
      .select({
        id: fuelLogs.id,
        carId: fuelLogs.carId,
        fuelDate: fuelLogs.fuelDate,
        odometer: fuelLogs.odometer,
        liters: fuelLogs.liters,
        pricePerLiter: fuelLogs.pricePerLiter,
        totalPrice: fuelLogs.totalPrice,
        fullTank: fuelLogs.fullTank,
        station: fuelLogs.station,
        createdAt: fuelLogs.createdAt,
      })
      .from(fuelLogs)
      .where(eq(fuelLogs.carId, carId))
      .orderBy(desc(fuelLogs.fuelDate), desc(fuelLogs.createdAt));
  }

  /**
   * =========================================================
   * DELETE
   * =========================================================
   */
  async delete(id: string) {
    await db.delete(fuelLogs).where(eq(fuelLogs.id, id));
  }

  /**
   * =========================================================
   * UPDATE
   * =========================================================
   *
   * Как и create, repository получает уже готовые данные.
   */
  async update(id: string, data: Omit<FuelLogDbInput, "carId">) {
    const [entry] = await db
      .update(fuelLogs)
      .set({
        fuelDate: data.fuelDate,
        odometer: data.odometer,
        liters: data.liters.toString(),
        pricePerLiter: data.pricePerLiter.toString(),
        totalPrice: data.totalPrice.toString(),
        fullTank: data.fullTank,
        station: data.station,
      })
      .where(eq(fuelLogs.id, id))
      .returning({
        id: fuelLogs.id,
        carId: fuelLogs.carId,
        fuelDate: fuelLogs.fuelDate,
        odometer: fuelLogs.odometer,
        liters: fuelLogs.liters,
        pricePerLiter: fuelLogs.pricePerLiter,
        totalPrice: fuelLogs.totalPrice,
        fullTank: fuelLogs.fullTank,
        station: fuelLogs.station,
        createdAt: fuelLogs.createdAt,
      });

    return entry;
  }

  /**
   * =========================================================
   * GET LAST LOG BEFORE OR ON DATE
   * =========================================================
   *
   * Это ключевой метод для валидации пробега.
   *
   * Ищем:
   * - записи этой машины
   * - только с odometer != null
   * - только на эту дату и раньше
   *
   * excludeId нужен для update:
   * чтобы запись не сравнивалась сама с собой.
   */
  async getLastLogBeforeOrOnDate(
    carId: string,
    fuelDate: string,
    excludeId?: string
  ) {
    const conditions = [
      eq(fuelLogs.carId, carId),
      lte(fuelLogs.fuelDate, fuelDate),
      isNotNull(fuelLogs.odometer),
    ];

    if (excludeId) {
      conditions.push(ne(fuelLogs.id, excludeId));
    }

    const [entry] = await db
      .select({
        id: fuelLogs.id,
        carId: fuelLogs.carId,
        fuelDate: fuelLogs.fuelDate,
        odometer: fuelLogs.odometer,
        liters: fuelLogs.liters,
        pricePerLiter: fuelLogs.pricePerLiter,
        totalPrice: fuelLogs.totalPrice,
        fullTank: fuelLogs.fullTank,
        station: fuelLogs.station,
        createdAt: fuelLogs.createdAt,
      })
      .from(fuelLogs)
      .where(and(...conditions))
      .orderBy(desc(fuelLogs.fuelDate), desc(fuelLogs.odometer), desc(fuelLogs.createdAt))
      .limit(1);

    return entry;
  }
}

export const fuelRepository = new FuelRepository();