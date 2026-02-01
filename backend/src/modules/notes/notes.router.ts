import { Router } from 'express';
import { createNote } from './notes.controller';

export const notesRouter = Router();

notesRouter.post('/', createNote);