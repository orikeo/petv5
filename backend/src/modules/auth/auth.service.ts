import bcrypt from "bcrypt";
import crypto from "crypto";

import { authRepository } from "./auth.repository";
import { AppError } from "../../errors/app-error";

import {
  generateAccessToken,
  generateRefreshToken,
  generateTokens,
} from "./jwt";

import {
  RegisterDto,
  LoginDto,
  TelegramAuthDto,
} from "./auth.types";

class AuthService {
  /**
   * =========================================================
   * REGISTER (email + password)
   * =========================================================
   *
   * Новая схема:
   *
   * 1. проверяем, не существует ли уже email provider
   * 2. создаём user
   * 3. создаём authProvider(email)
   */
  async register(dto: RegisterDto) {
    const existingAuth = await authRepository.findEmailAuth(dto.email);

    if (existingAuth) {
      throw new AppError("User already exists", 409);
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    /**
     * создаём сам аккаунт
     */
    const user = await authRepository.createUser();

    /**
     * создаём способ входа через email
     */
    await authRepository.createAuthProvider({
      userId: user.id,
      provider: "email",
      providerId: dto.email,
      passwordHash,
    });

    return {
      id: user.id,
      email: dto.email,
      role: user.role,
      createdAt: user.createdAt,
    };
  }

  /**
   * =========================================================
   * LOGIN (email + password)
   * =========================================================
   *
   * Новая схема:
   *
   * 1. ищем email provider
   * 2. сверяем пароль
   * 3. загружаем user
   * 4. выдаём токены
   */
  async login(dto: LoginDto) {
    const auth = await authRepository.findEmailAuth(dto.email);

    if (!auth || !auth.passwordHash) {
      throw new AppError("Invalid email or password", 401);
    }

    const isValid = await bcrypt.compare(dto.password, auth.passwordHash);

    if (!isValid) {
      throw new AppError("Invalid email or password", 401);
    }

    const user = await authRepository.findUserById(auth.userId);

    if (!user) {
      throw new AppError("User not found", 404);
    }

    const payload = {
      userId: user.id,
      role: user.role,
    };

    return {
      accessToken: generateAccessToken(payload),
      refreshToken: generateRefreshToken(payload),
    };
  }

  /**
   * =========================================================
   * TELEGRAM AUTH
   * =========================================================
   *
   * Универсальный сценарий:
   *
   * - если telegram provider уже есть → login
   * - если нет → create user + create telegram provider
   */
  async telegramLogin(dto: TelegramAuthDto) {
    if (!dto.telegramId) {
      throw new AppError("Telegram ID is required", 400);
    }

    let auth = await authRepository.findTelegramAuth(dto.telegramId);
    let isNewUser = false;

    if (!auth) {
      const user = await authRepository.createUser();

      auth = await authRepository.createAuthProvider({
        userId: user.id,
        provider: "telegram",
        providerId: dto.telegramId,
        passwordHash: null,
      });

      isNewUser = true;
    }

    const user = await authRepository.findUserById(auth.userId);

    if (!user) {
      throw new AppError("User not found", 404);
    }

    const tokens = generateTokens({
      userId: user.id,
      role: user.role,
    });

    return {
      ...tokens,
      isNewUser,
    };
  }

  /**
   * =========================================================
   * CREATE TELEGRAM LINK CODE
   * =========================================================
   *
   * Генерируем временный код для привязки Telegram
   * к уже существующему аккаунту.
   */
  async createTelegramLinkCode(userId: string) {
    const code = crypto.randomBytes(4).toString("hex");

    await authRepository.saveTelegramLinkCode(code, userId);

    return code;
  }

  /**
   * =========================================================
   * LINK TELEGRAM TO EXISTING USER
   * =========================================================
   *
   * Привязываем telegram как ещё один способ входа.
   *
   * ВАЖНО:
   * Здесь мы пока НЕ делаем автоматический merge двух user.
   * Если telegram уже привязан к другому аккаунту —
   * просто отдаём ошибку.
   *
   * Это безопаснее.
   */
  async linkTelegram(code: string, telegramId: string) {
    const record = await authRepository.findTelegramLinkCode(code);

    if (!record) {
      throw new AppError("Invalid or expired code", 400);
    }

    const siteUserId = record.userId;

    const existingTelegramAuth =
      await authRepository.findTelegramAuth(telegramId);

    /**
     * telegram уже привязан к другому пользователю
     */
    if (
      existingTelegramAuth &&
      existingTelegramAuth.userId !== siteUserId
    ) {
      throw new AppError(
        "This Telegram account is already linked to another user",
        409
      );
    }

    /**
     * telegram уже привязан к тому же аккаунту
     */
    if (
      existingTelegramAuth &&
      existingTelegramAuth.userId === siteUserId
    ) {
      await authRepository.deleteTelegramLinkCode(code);
      return;
    }

    /**
     * создаём telegram provider
     */
    await authRepository.createAuthProvider({
      userId: siteUserId,
      provider: "telegram",
      providerId: telegramId,
      passwordHash: null,
    });

    await authRepository.deleteTelegramLinkCode(code);
  }
}

export const authService = new AuthService();