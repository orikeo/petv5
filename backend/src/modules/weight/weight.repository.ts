import { db } from '../../db';
import { weightEntries } from '../../db/schema';
import { eq, and, gte, lte, sql } from 'drizzle-orm';
import { ParsedWeightQuery } from './weight.query';

class WeightRepository {
  async create(
  userId: string,
  data: {
    entryDate: string; // ← ВАЖНО
    weight: number;
    note?: string;
  }
) {
  const [entry] = await db
    .insert(weightEntries)
    .values({
      userId,
      entryDate: data.entryDate, // ✅ string
      weight: data.weight.toString(),
      note: data.note
    })
    .returning();

  return entry;
}
  async findByUser(
    userId: string,
    query: ParsedWeightQuery
  ) {
    const conditions = [
      eq(weightEntries.userId, userId)
    ];

    if (query.from) {
      conditions.push(
        gte(weightEntries.entryDate, query.from)
      );
    }

    if (query.to) {
      conditions.push(
        lte(weightEntries.entryDate, query.to)
      );
    }

    const items = await db
      .select()
      .from(weightEntries)
      .where(and(...conditions))
      .limit(query.limit)
      .offset(query.offset)
      .orderBy(weightEntries.entryDate);

    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(weightEntries)
      .where(and(...conditions));

    return {
      items,
      total: Number(count)
    };
  }
}

export const weightRepository = new WeightRepository();