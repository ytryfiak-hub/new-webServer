import { z } from 'zod';

// Перевірка UUID (первинний ключ таблиці users у PostgreSQL)
const userId = z.string().uuid('Некоректний ID користувача (має бути UUID)');

export const createUserSchema = z.object({
  body: z.object({
    name: z.string().min(2, "Ім'я має містити мінімум 2 символи").max(100),
    email: z.string().email('Некоректний формат email'),
    password: z.string().min(6, 'Пароль має бути не менше 6 символів'),
    age: z.coerce.number().int().min(0).max(150).optional(), // z.coerce автоматично перетворить "25" на 25
    surname: z.string().optional(),
    dateOfBirth: z.string().optional(),
  }),
});

export const userIdSchema = z.object({
  params: z.object({
    id: userId,
  }),
});

// Схема для оновлення будь-якого користувача за ID (наприклад, для Admin Panel)
export const updateUserSchema = z.object({
  params: z.object({
    id: userId,
  }),
  body: z
    .object({
      name: z.string().min(2).max(100).optional(),
      surname: z.string().min(2).max(100).optional(),
      email: z.string().email().optional(),
      password: z.string().min(6).optional(),
      age: z.number().int().min(0).max(150).optional(),
      dateOfBirth: z.string().datetime({ message: 'Некоректний ISO формат дати (наприклад: 1995-08-20T00:00:00.000Z)' }).optional(),
      photo: z.string().url('Посилання на фото має бути коректним URL').optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: 'Потрібно вказати хоча б одне поле для оновлення',
    }),
});

// Схема для власного профілю авторизованого користувача (PUT /api/users/profile)
export const updateProfileSchema = z.object({
  body: z
    .object({
      name: z.string().min(2, "Ім'я має містити мінімум 2 символи").max(100).optional(),
      surname: z.string().min(2, 'Прізвище має містити мінімум 2 символи').max(100).optional(),
      dateOfBirth: z.string().datetime({ message: 'Некоректний ISO формат дати (наприклад: 1995-08-20T00:00:00.000Z)' }).optional(),
      photo: z.string().url('Посилання на фото має бути коректним URL').optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: 'Потрібно вказати хоча б одне поле для оновлення профілю',
    }),
});

// Типи для контролерів та сервісів
export type CreateUserInput = z.infer<typeof createUserSchema>['body'];
export type UpdateUserInput = z.infer<typeof updateUserSchema>['body'];
export type UpdateProfileDto = z.infer<typeof updateProfileSchema>['body'];
export type UserIdParamsInput = z.infer<typeof userIdSchema>['params'];