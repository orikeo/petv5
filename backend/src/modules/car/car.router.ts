import { Router } from 'express';
import {
  createCar,
  getUserCars,
  getCarById,
  deleteCar
} from './car.controller';

const router = Router();

router.post('/', createCar);

router.get('/', getUserCars);

router.get('/:id', getCarById);

router.delete('/:id', deleteCar);

export default router;