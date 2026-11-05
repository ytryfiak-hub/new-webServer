import bcrypt from 'bcrypt';
import { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import { users } from '../db/schema';

// Повний рядок таблиці users (разом із секретними полями — лише для авторизації)
export type IUserWithSecrets = InferSelectModel<typeof users>;

// Публічне представлення користувача (без password і refreshToken)
export type IUser = Omit<IUserWithSecrets, 'password' | 'refreshToken'>;

export type NewUser = InferInsertModel<typeof users>;

// Поля, які можна записувати через репозиторій
export type UserWritableData = Partial<Omit<NewUser, 'id' | 'createdAt' | 'updatedAt'>>;

// Колонки, які повертаються у публічних відповідях
export const publicColumns = {
  id: users.id,
  name: users.name,
  surname: users.surname,
  email: users.email,
  age: users.age,
  dateOfBirth: users.dateOfBirth,
  photo: users.photo,
  createdAt: users.createdAt,
  updatedAt: users.updatedAt,
};

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function comparePassword(candidate: string, hash: string): Promise<boolean> {
  return bcrypt.compare(candidate, hash);
}
