import { pool } from '../config/database';
import {
  IUser,
  IUserWithSecrets,
  PUBLIC_COLUMNS,
  UserRow,
  UserWritableData,
  UserWritableField,
  hashPassword,
  toUser,
  toUserWithSecrets,
  userColumns,
} from '../models/user.model';
import { CreateUserInput } from '../validations/user.validation';

export interface UserFilter {
  search?: string;
}

// Нормалізація даних перед записом (аналог trim/lowercase/pre-save хука з Mongoose)
async function normalize(input: UserWritableData): Promise<UserWritableData> {
  const data: UserWritableData = {};

  for (const [key, value] of Object.entries(input)) {
    if (!(key in userColumns) || value === undefined) continue;
    data[key as UserWritableField] = typeof value === 'string' ? value.trim() : value;
  }

  if (typeof data.email === 'string') data.email = data.email.toLowerCase();
  if (typeof data.password === 'string') data.password = await hashPassword(data.password);

  return data;
}

function buildWhere(filter: UserFilter, startIndex = 1): { sql: string; params: unknown[] } {
  if (!filter.search) return { sql: '', params: [] };

  // Екрануємо спецсимволи LIKE, щоб пошук був буквальним
  const escaped = filter.search.replace(/[\\%_]/g, (ch) => `\\${ch}`);
  return {
    sql: `WHERE name ILIKE $${startIndex} OR email ILIKE $${startIndex}`,
    params: [`%${escaped}%`],
  };
}

// Створення користувача
async function create(input: CreateUserInput & { photo?: string }): Promise<IUser> {
  const data = await normalize(input);
  const fields = Object.keys(data) as UserWritableField[];
  const columns = fields.map((f) => userColumns[f]);
  const placeholders = fields.map((_, i) => `$${i + 1}`);

  const { rows } = await pool.query<UserRow>(
    `INSERT INTO users (${columns.join(', ')})
     VALUES (${placeholders.join(', ')})
     RETURNING ${PUBLIC_COLUMNS}`,
    fields.map((f) => data[f]),
  );
  return toUser(rows[0]);
}

// Звичайний пошук (БЕЗ пароля - для публічного профілю)
async function findByEmail(email: string): Promise<IUser | null> {
  const { rows } = await pool.query<UserRow>(
    `SELECT ${PUBLIC_COLUMNS} FROM users WHERE email = $1`,
    [email.trim().toLowerCase()],
  );
  return rows[0] ? toUser(rows[0]) : null;
}

// Пошук З ПАРОЛЕМ (використовується виключно при авторизації/логіні)
async function findByEmailWithPassword(email: string): Promise<IUserWithSecrets | null> {
  const { rows } = await pool.query<UserRow>('SELECT * FROM users WHERE email = $1', [
    email.trim().toLowerCase(),
  ]);
  return rows[0] ? toUserWithSecrets(rows[0]) : null;
}

async function findByEmailExcludingId(email: string, id: string): Promise<IUser | null> {
  const { rows } = await pool.query<UserRow>(
    `SELECT ${PUBLIC_COLUMNS} FROM users WHERE email = $1 AND id <> $2`,
    [email.trim().toLowerCase(), id],
  );
  return rows[0] ? toUser(rows[0]) : null;
}

async function findById(id: string): Promise<IUser | null> {
  const { rows } = await pool.query<UserRow>(
    `SELECT ${PUBLIC_COLUMNS} FROM users WHERE id = $1`,
    [id],
  );
  return rows[0] ? toUser(rows[0]) : null;
}

async function findMany(filter: UserFilter, skip: number, limit: number): Promise<IUser[]> {
  const where = buildWhere(filter);
  const n = where.params.length;

  const { rows } = await pool.query<UserRow>(
    `SELECT ${PUBLIC_COLUMNS} FROM users ${where.sql}
     ORDER BY created_at DESC
     LIMIT $${n + 1} OFFSET $${n + 2}`,
    [...where.params, limit, skip],
  );
  return rows.map(toUser);
}

async function count(filter: UserFilter): Promise<number> {
  const where = buildWhere(filter);
  const { rows } = await pool.query<{ count: string }>(
    `SELECT COUNT(*) AS count FROM users ${where.sql}`,
    where.params,
  );
  return Number(rows[0].count);
}

// Гнучке оновлення: приймає як UpdateUserInput, так і інші поля (наприклад, refreshToken)
async function updateById(id: string, input: UserWritableData): Promise<IUser | null> {
  const data = await normalize(input);
  const fields = Object.keys(data) as UserWritableField[];

  if (fields.length === 0) return findById(id);

  const assignments = fields.map((f, i) => `${userColumns[f]} = $${i + 2}`);
  const { rows } = await pool.query<UserRow>(
    `UPDATE users
     SET ${assignments.join(', ')}, updated_at = now()
     WHERE id = $1
     RETURNING ${PUBLIC_COLUMNS}`,
    [id, ...fields.map((f) => data[f])],
  );
  return rows[0] ? toUser(rows[0]) : null;
}

async function deleteById(id: string): Promise<IUser | null> {
  const { rows } = await pool.query<UserRow>(
    `DELETE FROM users WHERE id = $1 RETURNING ${PUBLIC_COLUMNS}`,
    [id],
  );
  return rows[0] ? toUser(rows[0]) : null;
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
