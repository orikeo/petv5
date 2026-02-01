import { CreateNoteDto } from './notes.types';
import { notesRepository } from './notes.repository';
import { ParsedNotesQuery } from './notes.query';

class NotesService {
  create(userId: string, dto: CreateNoteDto) {
    return notesRepository.create(userId, dto);
  }

  findAllByUser(userId: string) {
    return notesRepository.findAllByUser(userId);
  }

  findWithFilters(userId: string, query: ParsedNotesQuery) {
    return notesRepository.findWithFilters(userId, query);
  }
}

export const notesService = new NotesService();