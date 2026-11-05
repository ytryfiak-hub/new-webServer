import bcrypt from 'bcrypt';

// Публічне представлення користувача (без password і refreshToken)
export interface IUser {
  id: string;
  name: string;
  surname: string | null;
  email: string;
  age: number | null;
  dateOfBirth: Date | null;
  photo: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// Користувач разом із секретними полями (лише для авторизації)
export interface IUserWithSecrets extends IUser {
  password: string;
  refreshToken: string | null;
}

// Рядок таблиці users у PostgreSQL
export interface UserRow {
  id: string;
  name: string;
  surname: string | null;
  email: string;
  password: string;
  age: number | null;
  date_of_birth: Date | null;
  photo: string | null;
  refresh_token: string | null;
  created_at: Date;
  updated_at: Date;
}

// Відповідність полів API -> колонок БД (для insert/update)
export const userColumns = {
  name: 'name',
  surname: 'surname',
  email: 'email',
  password: 'password',
  age: 'age',
  dateOfBirth: 'date_of_birth',
  photo: 'photo',
  refreshToken: 'refresh_token',
} as const;

export type UserWritableField = keyof typeof userColumns;
export type UserWritableData = Partial<Record<UserWritableField, unknown>>;

export const PUBLIC_COLUMNS =
  'id, name, surname, email, age, date_of_birth, photo, created_at, updated_at';

export function toUser(row: UserRow): IUser {
  return {
    id: row.id,
    name: row.name,
    surname: row.surname,
    email: row.email,
    age: row.age,
    dateOfBirth: row.date_of_birth,
    photo: row.photo,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function toUserWithSecrets(row: UserRow): IUserWithSecrets {
  return {
    ...toUser(row),
    password: row.password,
    refreshToken: row.refresh_token,
  };
}

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function comparePassword(candidate: string, hash: string): Promise<boolean> {
  return bcrypt.compare(candidate, hash);
}
