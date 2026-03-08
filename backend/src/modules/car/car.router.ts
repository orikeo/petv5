import { Router } from 'express';
import {
  createCar,
  getUserCars,
  getCarById,
  deleteCar
} from './car.controller';
import { authGuard } from '../../middlewares/auth.middleware';
import { requireRole } from '../../middlewares/role.middleware';
import { UserRole } from '../auth/auth.roles';

export const carRouter = Router();

carRouter.post('/', authGuard, requireRole(UserRole.USER, UserRole.ADMIN, UserRole.OWNER), createCar);

carRouter.get('/', authGuard, requireRole(UserRole.USER, UserRole.ADMIN, UserRole.OWNER), getUserCars);

carRouter.get('/:id', authGuard, requireRole(UserRole.USER, UserRole.ADMIN, UserRole.OWNER), getCarById);

carRouter.delete('/:id', authGuard, requireRole(UserRole.USER, UserRole.ADMIN, UserRole.OWNER), deleteCar);


