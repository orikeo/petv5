import { Request, Response } from 'express';
import { CreateNoteDto } from './notes.types';
import { notesService } from './notes.service';

/**
 * Request<Params, ResBody, ReqBody>
 */
export const createNote = (
  req: Request<{}, {}, CreateNoteDto>,
  res: Response
) => {
  const note = notesService.create(req.body);
  res.status(201).json(note);
};