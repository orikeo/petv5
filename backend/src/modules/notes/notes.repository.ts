import { db } from '../../db';
import { notes } from '../../db/schema';
import { CreateNoteDto } from './notes.types';
import { eq, and, ilike, gte, lte, sql } from 'drizzle-orm';
import { ParsedNotesQuery } from './notes.query';

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


  async findById(id: string, userId: string) {
  const [note] = await db
    .select()
    .from(notes)
    .where(
      and(
        eq(notes.id, id),
        eq(notes.userId, userId)
      )
    );

  return note;
}

  async findAll() {
  return db.select().from(notes);
}

  async findAllByUser(userId: string) {
    return db
      .select()
      .from(notes)
      .where(eq(notes.userId, userId));
  }

   async findWithFilters(
    userId: string,
    query: ParsedNotesQuery
  ) {
    const conditions = [
      eq(notes.userId, userId)
    ];

    if (query.search) {
      conditions.push(
        ilike(notes.title, `%${query.search}%`)
      );
    }

    if (query.from) {
      conditions.push(
        gte(notes.createdAt, query.from)
      );
    }

    if (query.to) {
      conditions.push(
        lte(notes.createdAt, query.to)
      );
    }

    const items = await db
      .select()
      .from(notes)
      .where(and(...conditions))
      .limit(query.limit)
      .offset(query.offset)
      .orderBy(notes.createdAt);

    const [{ count }] = await db
      .select({
        count: sql<number>`count(*)`
      })
      .from(notes)
      .where(and(...conditions));

    return {
      items,
      total: Number(count)
    };
  }
}

export const notesRepository = new NotesRepository();