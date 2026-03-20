import { fuelRepository } from "./fuel.repository";
import { carRepository } from "../car.repository";
import { CreateFuelLogDto, UpdateFuelLogDto } from "./fuel.types";

class FuelService {
  /**
   * =========================================================
   * CREATE
   * =========================================================
   */
  async create(userId: string, data: CreateFuelLogDto) {
    /**
     * 1. Проверяем, что машина существует
     */
    const car = await carRepository.findById(data.carId);

    if (!car) {
      throw new Error("Машина не найдена");
    }

    /**
     * 2. Проверяем, что машина принадлежит пользователю
     */
    if (car.userId !== userId) {
      throw new Error("Нет доступа к этой машине");
    }

    /**
     * 3. Базовая валидация обязательных полей
     */
    this.validateFuelDate(data.fuelDate);
    this.validatePositiveNumber(data.liters, "Некорректное количество литров");
    this.validatePositiveNumber(
      data.pricePerLiter,
      "Некорректная цена за литр"
    );

    /**
     * 4. odometer теперь необязательный
     *    Но если он пришёл — проверяем:
     *    - это число
     *    - оно не отрицательное
     */
    if (data.odometer !== null && data.odometer !== undefined) {
      this.validateNonNegativeInteger(
        data.odometer,
        "Некорректный пробег"
      );

      /**
       * 5. Проверяем пробег относительно предыдущей записи
       *
       * Идея:
       * - ищем последнюю запись этой машины
       * - только с известным odometer
       * - только на эту дату и раньше
       *
       * Если такая запись есть, новый пробег не должен быть меньше.
       */
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

    /**
     * 6. totalPrice НЕ доверяем клиенту.
     *    Считаем на сервере сами.
     *
     * toFixed(2) нужен, чтобы не ловить типичные проблемы JS с float:
     * например 0.1 + 0.2 и т.д.
     */
    const totalPrice = Number(
      (data.liters * data.pricePerLiter).toFixed(2)
    );

    /**
     * 7. Создаём запись
     */
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

  /**
   * =========================================================
   * GET BY CAR
   * =========================================================
   */
  async getByCar(userId: string, carId: string) {
    /**
     * Проверяем доступ к машине
     */
    const car = await carRepository.findById(carId);

    if (!car) {
      throw new Error("Машина не найдена");
    }

    if (car.userId !== userId) {
      throw new Error("Нет доступа к этой машине");
    }

    return fuelRepository.findByCar(carId);
  }

  /**
   * =========================================================
   * DELETE
   * =========================================================
   */
  async delete(userId: string, id: string) {
    /**
     * Получаем лог по id
     */
    const log = await fuelRepository.getById(id);

    if (!log) {
      throw new Error("Запись о заправке не найдена");
    }

    /**
     * Проверяем доступ через машину
     */
    const car = await carRepository.findById(log.carId);

    if (!car) {
      throw new Error("Машина не найдена");
    }

    if (car.userId !== userId) {
      throw new Error("Нет доступа к этой машине");
    }

    await fuelRepository.delete(id);
  }

  /**
   * =========================================================
   * UPDATE
   * =========================================================
   *
   * Здесь логика похожа на create,
   * но сначала получаем старую запись.
   */
  async update(userId: string, id: string, data: UpdateFuelLogDto) {
    /**
     * 1. Проверяем, что запись существует
     */
    const existingLog = await fuelRepository.getById(id);

    if (!existingLog) {
      throw new Error("Запись о заправке не найдена");
    }

    /**
     * 2. Проверяем доступ к машине
     */
    const car = await carRepository.findById(existingLog.carId);

    if (!car) {
      throw new Error("Машина не найдена");
    }

    if (car.userId !== userId) {
      throw new Error("Нет доступа к этой машине");
    }

    /**
     * 3. Собираем итоговые значения:
     *    если поле не пришло в update — берём старое
     */
    const fuelDate = data.fuelDate ?? existingLog.fuelDate;
    const odometer =
      data.odometer !== undefined ? data.odometer : existingLog.odometer;
    const liters = data.liters ?? Number(existingLog.liters);
    const pricePerLiter =
      data.pricePerLiter ?? Number(existingLog.pricePerLiter);
    const fullTank = data.fullTank ?? existingLog.fullTank;
    const station =
      data.station !== undefined ? data.station : existingLog.station;

    /**
     * 4. Валидируем собранные итоговые данные
     */
    this.validateFuelDate(fuelDate);
    this.validatePositiveNumber(liters, "Некорректное количество литров");
    this.validatePositiveNumber(
      pricePerLiter,
      "Некорректная цена за литр"
    );

    if (odometer !== null && odometer !== undefined) {
      this.validateNonNegativeInteger(odometer, "Некорректный пробег");

      /**
       * В update важно не сравнить запись саму с собой,
       * поэтому нужен метод, который исключает текущий id.
       */
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

    /**
     * 5. Пересчитываем totalPrice заново
     */
    const totalPrice = Number((liters * pricePerLiter).toFixed(2));

    /**
     * 6. Обновляем запись
     */
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

  /**
   * =========================================================
   * HELPERS
   * =========================================================
   */

  /**
   * Проверка даты.
   *
   * Пока делаем базово:
   * - поле обязательно
   * - должно парситься в Date
   *
   * Позже можно усилить:
   * - не разрешать слишком далёкое будущее
   * - строго проверять формат YYYY-MM-DD
   */
  private validateFuelDate(value: string) {
    if (!value || Number.isNaN(Date.parse(value))) {
      throw new Error("Некорректная дата заправки");
    }
  }

  /**
   * Проверка положительного числа (> 0)
   *
   * Используем для liters и pricePerLiter
   */
  private validatePositiveNumber(value: number, errorMessage: string) {
    if (
      typeof value !== "number" ||
      Number.isNaN(value) ||
      value <= 0
    ) {
      throw new Error(errorMessage);
    }
  }

  /**
   * Проверка целого неотрицательного числа (>= 0)
   *
   * Используем для odometer
   */
  private validateNonNegativeInteger(
    value: number,
    errorMessage: string
  ) {
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