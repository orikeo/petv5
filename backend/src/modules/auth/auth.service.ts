import bcrypt from 'bcrypt';

import { authRepository } from './auth.repository';
import { AppError } from '../../errors/app-error';

import {
  generateAccessToken,
  generateRefreshToken
} from './jwt';

import {
  RegisterDto,
  LoginDto,
  TelegramAuthDto
} from './auth.types';

class AuthService {
  // -------------------------
  // REGISTER (email + password)
  // -------------------------
  async register(dto: RegisterDto) {
    const existingUser = await authRepository.findByEmail(dto.email);

    if (existingUser) {
      throw new AppError('User already exists', 409);
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const user = await authRepository.create(dto.email, passwordHash);

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt
    };
  }

  // -------------------------
  // LOGIN (email + password)
  // -------------------------
  async login(dto: LoginDto) {
    const user = await authRepository.findByEmail(dto.email);

    if (!user || !user.passwordHash) {
      throw new AppError('Invalid email or password', 401);
    }

    const isValid = await bcrypt.compare(
      dto.password,
      user.passwordHash
    );

    if (!isValid) {
      throw new AppError('Invalid email or password', 401);
    }

    const payload = {
      userId: user.id,
      role: user.role
    };

    return {
      accessToken: generateAccessToken(payload),
      refreshToken: generateRefreshToken(payload)
    };
  }

  // -------------------------
  // TELEGRAM LOGIN
  // -------------------------
  async telegramLogin(dto: TelegramAuthDto) {
    let user = await authRepository.findByTelegramId(dto.telegramId);

    if (!user) {
      user = await authRepository.createTelegramUser(dto.telegramId);
    }

    const payload = {
      userId: user.id,
      role: user.role
    };

    return {
      accessToken: generateAccessToken(payload)
    };
  }
}

export const authService = new AuthService();