import { CreateNoteDto } from './notes.types';
import { notesRepository } from './notes.repository';

class NotesService {
  create(dto: CreateNoteDto) {
    return notesRepository.create(dto);
  }

  findAll() {
    return notesRepository.findAll();
  }
}

export const notesService = new NotesService();