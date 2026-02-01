import { CreateWeightDto } from './weight.types';
import { AppError } from '../../errors/app-error';

export const validateCreateWeight = (dto: CreateWeightDto) => {
  if (!dto.entryDate || isNaN(Date.parse(dto.entryDate))) {
    throw new AppError('Invalid entryDate', 400);
  }

  if (typeof dto.weight !== 'number' || dto.weight <= 0) {
    throw new AppError('Invalid weight', 400);
  }

  if (dto.note && typeof dto.note !== 'string') {
    throw new AppError('Invalid note', 400);
  }
};