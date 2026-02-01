import { db } from '../../db';
import { notes } from '../../db/schema';
import { CreateNoteDto } from './notes.types';
import { eq } from 'drizzle-orm';

class NotesRepository {
  async create(userId: string, dto: CreateNoteDto) {
    const [note] = await db
      .insert(notes)
      .values({
        userId,
        title: dto.title,
        content: dto.content
      })
      .returning();

    return note;
  }

  async findAllByUser(userId: string) {
    return db
      .select()
      .from(notes)
      .where(eq(notes.userId, userId));
  }
}

export const notesRepository = new NotesRepository();