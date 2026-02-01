import 'express';
import { UserRole } from '../modules/auth/auth.roles';

declare module 'express' {
  export interface Request {
    user?: {
      id: string;
      role: UserRole;
    };
  }
}