import jwt, { Secret, SignOptions } from 'jsonwebtoken';
import type { StringValue } from 'ms';
import { env } from '../../config/env';
import { UserRole } from './auth.roles';



export interface JwtPayload {
  userId: string;
  role: UserRole;
}

const accessSecret: Secret = env.jwtAccessSecret;
const refreshSecret: Secret = env.jwtRefreshSecret;

const accessOptions: SignOptions = {
  expiresIn: env.jwtAccessExpiresIn as StringValue
};

const refreshOptions: SignOptions = {
  expiresIn: env.jwtRefreshExpiresIn as StringValue
};

export const generateAccessToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, accessSecret, accessOptions);
};

export const generateRefreshToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, refreshSecret, refreshOptions);
};

export const verifyAccessToken = (token: string): JwtPayload => {
  return jwt.verify(token, env.jwtAccessSecret) as JwtPayload;
};

export const verifyRefreshToken = (token: string): JwtPayload => {
  return jwt.verify(token, env.jwtRefreshSecret) as JwtPayload;
};

export const generateTokens = (
  payload: JwtPayload
) => {
  const accessToken =
    generateAccessToken(payload);

  const refreshToken =
    generateRefreshToken(payload);

  return {
    accessToken,
    refreshToken
  };
};