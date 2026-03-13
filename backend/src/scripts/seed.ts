import 'dotenv/config';
import { faker } from '@faker-js/faker';
import { db } from '../db';
import {
  users,
  notes,
  weightEntries
} from '../db/schema';
import { eq } from 'drizzle-orm';
import { UserRole } from '../modules/auth/auth.roles';

const SITE_USERS = 10;

async function seed() {
  console.log('🌱 Seeding database...');

  
  console.log('✅ Seed finished');
}

seed()
  .then(() => process.exit(0))
  .catch(err => {
    console.error(err);
    process.exit(1);
  });