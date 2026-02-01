import { Request, Response } from 'express';
import { CreateNoteDto } from './notes.types';
import { notesService } from './notes.service';
import { validateCreateNote } from './notes.validator';

export const createNote = async (
  req: Request<{}, {}, CreateNoteDto>,
  res: Response
) => {
  if (!req.user) {
    // на практике сюда не дойдёт из-за authGuard
    throw new Error('User not found in request');
  }

  validateCreateNote(req.body);

  const note = await notesService.create(
    req.user.id,
    req.body
  );

  res.status(201).json(note);
};

export const getNotes = async (
  req: Request,
  res: Response
) => {
  if (!req.user) {
    throw new Error('User not found in request');
  }

  const notes = await notesService.findAllByUser(
    req.user.id
  );

  res.json(notes);
};