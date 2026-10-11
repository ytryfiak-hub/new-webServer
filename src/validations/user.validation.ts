import { z } from 'zod';

export const createUserSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(100),
    email: z.string().email(),
    password: z.string().min(6),
    age: z.number().int().min(0).max(150).optional(),
  }),
});

export const updateUserSchema = z.object({
  params: z.object({
    id: z.string().length(24, 'Invalid user id'),
  }),
  body: z
    .object({
      name: z.string().min(2).max(100).optional(),
      email: z.string().email().optional(),
      password: z.string().min(6).optional(),
      age: z.number().int().min(0).max(150).optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: 'At least one field must be provided for update',
    }),
});

export const userIdSchema = z.object({
  params: z.object({
    id: z.string().length(24, 'Invalid user id'),
  }),
});

export type CreateUserInput = z.infer<typeof createUserSchema>['body'];
export type UpdateUserInput = z.infer<typeof updateUserSchema>['body'];
