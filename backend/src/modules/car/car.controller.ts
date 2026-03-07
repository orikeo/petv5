import { Request, Response } from 'express';
import { carService } from './car.service';
import { CreateCarDto } from './car.types';
import { AppError } from '../../errors/app-error';


/**
 * Создание машины
 * POST /cars
 */
export const createCar = async (
  req: Request<{}, {}, CreateCarDto>,
  res: Response
) => {

  // проверяем что пользователь авторизован
  if (!req.user) {
    throw new AppError('Unauthorized', 401);
  }

  // получаем данные из body
  const dto = req.body;

  // вызываем сервис
  const car = await carService.createCar(req.user.id, dto);

  // возвращаем результат
  res.status(201).json(car);
};



/**
 * Получить список машин пользователя
 * GET /cars
 */
export const getUserCars = async (
  req: Request,
  res: Response
) => {

  if (!req.user) {
    throw new AppError('Unauthorized', 401);
  }

  // получаем машины пользователя
  const cars = await carService.getUserCars(req.user.id);

  res.json(cars);
};



/**
 * Получить одну машину
 * GET /cars/:id
 */
export const getCarById = async (
  req: Request<{ id: string }>,
  res: Response
) => {

  const { id } = req.params;

  const car = await carService.getCarById(id);

  if (!car) {
    throw new AppError('Car not found', 404);
  }

  res.json(car);
};



/**
 * Удалить машину
 * DELETE /cars/:id
 */
export const deleteCar = async (
  req: Request<{ id: string }>,
  res: Response
) => {

  const { id } = req.params;

  await carService.deleteCar(id);

  res.status(204).send();
};