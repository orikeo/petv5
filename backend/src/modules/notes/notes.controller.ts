import { Request, Response } from 'express';
import { CreateNoteDto } from './notes.types';
import { notesService } from './notes.service';
import { validateCreateNote } from './notes.validator';

export const createNote = async (
  req: Request<{}, {}, CreateNoteDto>,
  res: Response
) => {
  validateCreateNote(req.body);

  const note = await notesService.create(req.body);
  res.status(201).json(note);
};

export const getNotes = async (
  _req: Request,
  res: Response
) => {
  const notes = await notesService.findAll();
  res.json(notes);
};