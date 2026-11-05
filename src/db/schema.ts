import { sql } from 'drizzle-orm';
import { check, index, integer, pgTable, text, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';

export const users = pgTable(
  'users',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: varchar('name', { length: 100 }).notNull(),
    surname: varchar('surname', { length: 100 }),
    email: varchar('email', { length: 255 }).notNull().unique(),
    password: text('password').notNull(),
    age: integer('age'),
    dateOfBirth: timestamp('date_of_birth', { withTimezone: true }),
    photo: text('photo'),
    refreshToken: text('refresh_token'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index('users_created_at_idx').on(table.createdAt.desc()),
    check('users_name_check', sql`char_length(${table.name}) >= 2`),
    check('users_surname_check', sql`${table.surname} IS NULL OR char_length(${table.surname}) >= 2`),
    check('users_age_check', sql`${table.age} IS NULL OR (${table.age} >= 0 AND ${table.age} <= 150)`),
  ],
);
