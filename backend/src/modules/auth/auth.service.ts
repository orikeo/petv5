import bcrypt from 'bcrypt';
import { RegisterDto } from './auth.types';
import { authRepository } from './auth.repository';
import { AppError } from '../../errors/app-error';

class AuthService {
  async register(dto: RegisterDto) {
    const existingUser = await authRepository.findByEmail(dto.email);

    if (existingUser) {
      throw new AppError('User already exists', 409);
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const user = await authRepository.create(
      dto.email,
      passwordHash
    );

    return {
      id: user.id,
      email: user.email,
      createdAt: user.createdAt
    };
  }
}

export const authService = new AuthService();