import { Request, Response } from 'express';
import { CreateNoteDto , NotesQueryDto } from './notes.types';
import { notesService } from './notes.service';
import { validateCreateNote } from './notes.validator';
import { parseNotesQuery } from './notes.query';

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
  req: Request<{}, {}, {}, NotesQueryDto>,
  res: Response
) => {
  console.log('REQ USER ID:', req.user?.id);
  if (!req.user) {
    throw new Error('Unauthorized');
  }

  const parsedQuery = parseNotesQuery(req.query);

  const result = await notesService.findWithFilters(
    req.user.id,
    parsedQuery
  );

  res.json({
    items: result.items,
    page: parsedQuery.page,
    limit: parsedQuery.limit,
    total: result.total
  });
};

export const getAllNotes = async (
  _req: Request,
  res: Response
) => {
  const notes = await notesService.findAll(); // без userId
  res.json(notes);
};


export const getNoteById = async (
  req: Request<{ id: string }>,
  res: Response
) => {
  if (!req.user) {
    throw new Error('Unauthorized');
  }

  const note = await notesService.findOne(
    req.params.id,
    req.user.id
  );

  if (!note) {
    return res.status(404).json({
      message: 'Note not found'
    });
  }

  res.json(note);
};