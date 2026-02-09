import { Router } from 'express';
import { createWeight, getWeights, getWeightHistory } from './weight.controller';
import { authGuard } from '../../middlewares/auth.middleware';

export const weightRouter = Router();

weightRouter.post('/', authGuard, createWeight);
weightRouter.get('/', authGuard, getWeights);
weightRouter.get(
  '/history',
  authGuard,
  getWeightHistory
);