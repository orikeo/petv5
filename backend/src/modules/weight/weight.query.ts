import { WeightQueryDto } from './weight.types';
import { AppError } from '../../errors/app-error';

export interface ParsedWeightQuery {
  page: number;
  limit: number;
  offset: number;
  from?: string; // YYYY-MM-DD
  to?: string;   // YYYY-MM-DD
}

export const parseWeightQuery = (
  query: WeightQueryDto
): ParsedWeightQuery => {
  const page = query.page ? Number(query.page) : 1;
  const limit = query.limit ? Number(query.limit) : 10;

  if (page < 1 || Number.isNaN(page)) {
    throw new AppError('Invalid page', 400);
  }

  if (limit < 1 || limit > 100 || Number.isNaN(limit)) {
    throw new AppError('Invalid limit', 400);
  }

  // минимальная валидация даты
  if (query.from && isNaN(Date.parse(query.from))) {
    throw new AppError('Invalid from date', 400);
  }

  if (query.to && isNaN(Date.parse(query.to))) {
    throw new AppError('Invalid to date', 400);
  }

  return {
    page,
    limit,
    offset: (page - 1) * limit,
    from: query.from,
    to: query.to
  };
};