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

  findOne(id: string, userId: string) {
  return notesRepository.findById(id, userId);
}

  findAll() {
  return notesRepository.findAll();
}
}

export const notesService = new NotesService();