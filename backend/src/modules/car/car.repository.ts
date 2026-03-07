import { db } from '../../db';
import { cars } from '../../db/schema';
import { eq, and, gte, lte, sql, desc, asc } from 'drizzle-orm';

class CarRepository {

  async create(userId: string, name: string) {
    const [car] = await db.insert(cars)
      .values({ userId, name })
      .returning();

    return car;
  }

  async findByUser(userId: string) {
    return db.select()
      .from(cars)
      .where(eq(cars.userId, userId));
  }

  async findById(id: string) {
    const [car] = await db.select()
      .from(cars)
      .where(eq(cars.id, id));

    return car;
  }

  async delete(id: string) {
    const result = await db.delete(cars)
      .where(eq(cars.id, id))
      .returning();

    return result;
  }

}

export const carRepository = new CarRepository();