import { CreateCarDto } from './car.types';
import { carRepository } from './car.repository';
import { AppError } from '../../errors/app-error';

class CarService {

  /**
   * Создать машину
   */
  async createCar(userId: string, dto: CreateCarDto) {
    return carRepository.create(userId, dto.name);
  }


  /**
   * Получить все машины пользователя
   */
  async getUserCars(userId: string) {
    return carRepository.findByUser(userId);
  }


  /**
   * Получить машину по id
   */
  async getCarById(id: string) {

    const car = await carRepository.findById(id);

    if (!car) {
      throw new AppError('Car not found', 404);
    }

    return car;
  }


  /**
   * Удалить машину
   */
  async deleteCar(id: string) {

    const car = await carRepository.findById(id);

    if (!car) {
      throw new AppError('Car not found', 404);
    }

    await carRepository.delete(id);

    return true;
  }

}

export const carService = new CarService();