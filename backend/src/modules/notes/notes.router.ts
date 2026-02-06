import { Router } from 'express';
import { createNote, getNotes, getAllNotes, getNoteById } from './notes.controller';
import { authGuard } from '../../middlewares/auth.middleware';
import { requireRole } from '../../middlewares/role.middleware';
import { UserRole } from '../auth/auth.roles';

export const notesRouter = Router();

notesRouter.post(
  '/',
  authGuard,
  requireRole(UserRole.USER, UserRole.ADMIN, UserRole.OWNER),
  createNote
);

notesRouter.get(
  '/',
  authGuard,
  requireRole(UserRole.USER, UserRole.ADMIN, UserRole.OWNER),
  getNotes
);

notesRouter.get(
  '/all',
  authGuard,
  requireRole(UserRole.ADMIN, UserRole.OWNER),
  getAllNotes
);

notesRouter.get(
  '/:id',
  authGuard,
  getNoteById
);