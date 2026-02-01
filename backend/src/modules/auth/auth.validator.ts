import { RegisterDto } from './auth.types';
import { AppError } from '../../errors/app-error';

export const validateRegister = (dto: RegisterDto) => {
  if (!dto.email || !dto.email.includes('@')) {
    throw new AppError('Invalid email', 400);
  }

  if (!dto.password || dto.password.length < 6) {
    throw new AppError('Password must be at least 6 characters', 400);
  }
};