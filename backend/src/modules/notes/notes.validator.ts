import { CreateNoteDto } from './notes.types';
import { AppError } from '../../errors/app-error';

export const validateCreateNote = (dto: CreateNoteDto) => {
  if (!dto.title || typeof dto.title !== 'string') {
    throw new AppError('Title is required', 400);
  }

  if (dto.title.length < 3) {
    throw new AppError('Title must be at least 3 characters', 400);
  }

  if (dto.content && typeof dto.content !== 'string') {
    throw new AppError('Content must be a string', 400);
  }
};