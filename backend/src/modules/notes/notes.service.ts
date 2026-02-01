import { CreateNoteDto } from './notes.types';
import { notesRepository } from './notes.repository';

class NotesService {
  create(userId: string, dto: CreateNoteDto) {
    return notesRepository.create(userId, dto);
  }

  findAllByUser(userId: string) {
    return notesRepository.findAllByUser(userId);
  }
}

export const notesService = new NotesService();