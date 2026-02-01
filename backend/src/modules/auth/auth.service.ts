import bcrypt from 'bcrypt';
import { RegisterDto, LoginDto } from './auth.types';
import { authRepository } from './auth.repository';
import { AppError } from '../../errors/app-error';
import {
  generateAccessToken,
  generateRefreshToken
} from './jwt';

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

  async login(dto: LoginDto) {
    const user = await authRepository.findByEmail(dto.email);

    if (!user) {
      throw new AppError('Invalid email or password', 401);
    }

    const isValid = await bcrypt.compare(
      dto.password,
      user.passwordHash
    );

    if (!isValid) {
      throw new AppError('Invalid email or password', 401);
    }

    const payload = { userId: user.id };

    return {
      accessToken: generateAccessToken(payload),
      refreshToken: generateRefreshToken(payload)
    };
}
}

export const authService = new AuthService();