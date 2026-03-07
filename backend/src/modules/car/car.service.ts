import { CreateCarDto } from './car.types';
import { carRepository } from './car.repository';

class CarService {
  createCar(userId: string, dto: CreateCarDto) {
  return carRepository.create(userId, dto.name);
}


  getUserCars(userId: string) {
  return carRepository.findByUser(userId);
}

}

export const carService = new CarService();