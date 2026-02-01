import { db } from '../../db';
import { users } from '../../db/schema';
import { eq } from 'drizzle-orm';

class AuthRepository {
  async findByEmail(email: string) {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email));

    return user;
  }

  async create(email: string, passwordHash: string) {
    const [user] = await db
      .insert(users)
      .values({ email, passwordHash })
      .returning();

    return user;
  }
}

export const authRepository = new AuthRepository();