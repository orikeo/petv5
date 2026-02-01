import { Router } from 'express';
import { createWeight, getWeights } from './weight.controller';
import { authGuard } from '../../middlewares/auth.middleware';

export const weightRouter = Router();

weightRouter.post('/', authGuard, createWeight);
weightRouter.get('/', authGuard, getWeights);