import { Request, Response } from 'express';
import { parseIntSafe } from '../../utils/parseIntSafe';
import { CreateWeightDto, WeightQueryDto, WeightHistoryQueryDto } from './weight.types';
import { validateCreateWeight } from './weight.validator';
import { parseWeightQuery } from './weight.query';
import { weightService } from './weight.service';


export const createWeight = async (
  req: Request<{}, {}, CreateWeightDto>,
  res: Response
) => {
  if (!req.user) throw new Error('Unauthorized');

  validateCreateWeight(req.body);

  const entry = await weightService.create(
    req.user.id,
    req.body
  );

  res.status(201).json(entry);
};

export const getWeights = async (
  req: Request<{}, {}, {}, WeightQueryDto>,
  res: Response
) => {
  if (!req.user) throw new Error('Unauthorized');

  const query = parseWeightQuery(req.query);

  const result = await weightService.findByUser(
    req.user.id,
    query
  );

  res.json({
    items: result.items,
    page: query.page,
    limit: query.limit,
    total: result.total
  });
};


export const getWeightHistory = async (
  req: Request<{}, {}, {}, WeightHistoryQueryDto>,
  res: Response
) => {
  if (!req.user) {
    throw new Error('Unauthorized');
  }

  const page = parseIntSafe(req.query.page, 1);
  const limit = parseIntSafe(req.query.limit, 5);

  const items = await weightService.getHistory(
    req.user.id,
    page,
    limit
  );

  res.json({
    items,
    page,
    limit
  });
};