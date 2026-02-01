import { NotesQueryDto } from './notes.types';
import { AppError } from '../../errors/app-error';

export interface ParsedNotesQuery {
  page: number;
  limit: number;
  offset: number;
  search?: string;
  from?: Date;
  to?: Date;
}

export const parseNotesQuery = (
  query: NotesQueryDto
): ParsedNotesQuery => {
  const page = query.page ? Number(query.page) : 1;
  const limit = query.limit ? Number(query.limit) : 10;

  if (Number.isNaN(page) || page < 1) {
    throw new AppError('Invalid page', 400);
  }

  if (Number.isNaN(limit) || limit < 1 || limit > 100) {
    throw new AppError('Invalid limit', 400);
  }

  return {
    page,
    limit,
    offset: (page - 1) * limit,
    search: query.search,
    from: query.from ? new Date(query.from) : undefined,
    to: query.to ? new Date(query.to) : undefined
  };
};