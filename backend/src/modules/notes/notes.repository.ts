import { db } from '../../db';
import { notes } from '../../db/schema';
import { CreateNoteDto } from './notes.types';

class NotesRepository {
  async create(dto: CreateNoteDto) {
    const [note] = await db
      .insert(notes)
      .values({
        title: dto.title,
        content: dto.content
      })
      .returning();

    return note;
  }
}

export const notesRepository = new NotesRepository();