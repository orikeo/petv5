import { CreateNoteDto } from './notes.types';

class NotesService {
  create(dto: CreateNoteDto) {
    return {
      id: crypto.randomUUID(),
      title: dto.title,
      content: dto.content ?? null,
      createdAt: new Date()
    };
  }
}

export const notesService = new NotesService();