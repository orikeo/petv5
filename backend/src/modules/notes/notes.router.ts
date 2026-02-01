import { Router } from 'express';
import { createNote, getNotes } from './notes.controller';

export const notesRouter = Router();

notesRouter.post('/', createNote);
notesRouter.get('/', getNotes);