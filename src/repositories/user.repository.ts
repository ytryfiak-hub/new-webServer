import { SQL, and, count as countFn, desc, eq, ilike, ne, or } from 'drizzle-orm';
import { db } from '../config/database';
import { users } from '../db/schema';
import {
  IUser,
  IUserWithSecrets,
  UserWritableData,
  hashPassword,
  publicColumns,
} from '../models/user.model';
import { ApiError } from '../utils/ApiError';

export interface UserFilter {
  search?: string;
}

// Вхідні дані з контролерів: дата народження приходить рядком
type UserInput = Omit<UserWritableData, 'dateOfBirth'> & {
  dateOfBirth?: string | Date | null;
};

const writableKeys = [
  'name',
  'surname',
  'email',
  'password',
  'age',
  'dateOfBirth',
  'photo',
  'refreshToken',
] as const satisfies readonly (keyof UserWritableData)[];

// Нормалізація даних перед записом: whitelist полів, trim, lowercase email, хеш пароля
async function normalize(input: UserInput): Promise<UserWritableData> {
  const data: Record<string, unknown> = {};

  for (const key of writableKeys) {
    const value = input[key];
    if (value === undefined) continue;
    data[key] = typeof value === 'string' ? value.trim() : value;
  }

  if (typeof data.email === 'string') data.email = data.email.toLowerCase();
  if (typeof data.password === 'string') data.password = await hashPassword(data.password);

  if (typeof data.dateOfBirth === 'string') {
    const date = new Date(data.dateOfBirth);
    if (Number.isNaN(date.getTime())) {
      throw ApiError.badRequest('dateOfBirth: некоректна дата');
    }
    data.dateOfBirth = date;
  }

  return data as UserWritableData;
}

function buildWhere(filter: UserFilter): SQL | undefined {
  if (!filter.search) return undefined;

  // Екрануємо спецсимволи LIKE, щоб пошук був буквальним
  const pattern = `%${filter.search.replace(/[\\%_]/g, (ch) => `\\${ch}`)}%`;
  return or(ilike(users.name, pattern), ilike(users.email, pattern));
}

const normalizeEmail = (email: string) => email.trim().toLowerCase();

// Створення користувача
async function create(
  input: UserInput & Pick<Required<UserWritableData>, 'name' | 'email' | 'password'>,
): Promise<IUser> {
  const data = await normalize(input);
  const [user] = await db
    .insert(users)
    .values(data as typeof users.$inferInsert)
    .returning(publicColumns);
  return user;
}

// Звичайний пошук (БЕЗ пароля - для публічного профілю)
async function findByEmail(email: string): Promise<IUser | null> {
  const [user] = await db
    .select(publicColumns)
    .from(users)
    .where(eq(users.email, normalizeEmail(email)));
  return user ?? null;
}

// Пошук З ПАРОЛЕМ (використовується виключно при авторизації/логіні)
async function findByEmailWithPassword(email: string): Promise<IUserWithSecrets | null> {
  const [user] = await db.select().from(users).where(eq(users.email, normalizeEmail(email)));
  return user ?? null;
}

async function findByEmailExcludingId(email: string, id: string): Promise<IUser | null> {
  const [user] = await db
    .select(publicColumns)
    .from(users)
    .where(and(eq(users.email, normalizeEmail(email)), ne(users.id, id)));
  return user ?? null;
}

async function findById(id: string): Promise<IUser | null> {
  const [user] = await db.select(publicColumns).from(users).where(eq(users.id, id));
  return user ?? null;
}

async function findMany(filter: UserFilter, skip: number, limit: number): Promise<IUser[]> {
  return db
    .select(publicColumns)
    .from(users)
    .where(buildWhere(filter))
    .orderBy(desc(users.createdAt))
    .limit(limit)
    .offset(skip);
}

async function count(filter: UserFilter): Promise<number> {
  const [row] = await db.select({ value: countFn() }).from(users).where(buildWhere(filter));
  return row.value;
}

// Гнучке оновлення: приймає як UpdateUserInput, так і інші поля (наприклад, refreshToken)
async function updateById(id: string, input: UserInput): Promise<IUser | null> {
  const data = await normalize(input);
  if (Object.keys(data).length === 0) return findById(id);

  const [user] = await db.update(users).set(data).where(eq(users.id, id)).returning(publicColumns);
  return user ?? null;
}

async function deleteById(id: string): Promise<IUser | null> {
  const [user] = await db.delete(users).where(eq(users.id, id)).returning(publicColumns);
  return user ?? null;
}

export const userRepository = {
  create,
  findByEmail,
  findByEmailWithPassword, // Для логіну
  findByEmailExcludingId,
  findById,
  findMany,
  count,
  updateById,
  deleteById,
};

export default userRepository;
