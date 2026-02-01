import 'dotenv/config';

export const env = {
  databaseUrl: process.env.DATABASE_URL as string,

  jwtAccessSecret: process.env.JWT_ACCESS_SECRET as string,
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET as string,
  jwtAccessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN as string,
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN as string
};