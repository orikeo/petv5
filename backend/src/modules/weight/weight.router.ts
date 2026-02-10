import { Router } from 'express';
import { createWeight, getWeights, getWeightHistory, getWeightChart } from './weight.controller';
import { authGuard } from '../../middlewares/auth.middleware';

export const weightRouter = Router();

weightRouter.post('/', authGuard, createWeight);
weightRouter.get('/', authGuard, getWeights);
weightRouter.get(
  '/history',
  authGuard,
  getWeightHistory
);
weightRouter.get(
  '/chart',
  authGuard,
  getWeightChart
);