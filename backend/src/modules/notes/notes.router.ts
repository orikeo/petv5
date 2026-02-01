import { Router } from 'express';
import { createNote, getNotes } from './notes.controller';
import { authGuard } from '../../middlewares/auth.middleware';

export const notesRouter = Router();

notesRouter.post('/', authGuard, createNote);
notesRouter.get('/', authGuard, getNotes);