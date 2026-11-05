import { Router } from 'express';
import {
  createUser,
  deleteUser,
  getUserById,
  getUsers,
  updateProfile,
  updateUser,
} from '../controllers/user.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { uploadPhoto } from '../middlewares/upload.middleware';
import { validate } from '../middlewares/validate';
import {
  createUserSchema,
  updateProfileSchema,
  updateUserSchema,
  userIdSchema,
} from '../validations/user.validation';

const router = Router();

// 1. Створення користувача з підтримкою аватарки (POST /api/users)
router.post(
  '/',
  uploadPhoto.single('photo'), // Завантаження фото
  validate(createUserSchema),  // Валідація req.body
  createUser,
);

// 2. Отримання списку користувачів
router.get('/', getUsers);

// 3. Оновлення власного профілю з можливістю змінити фото (PUT /api/users/profile)
router.put(
  '/profile',
  authMiddleware,
  uploadPhoto.single('photo'), // Завантаження нових фото при оновленні
  validate(updateProfileSchema),
  updateProfile,
);

// 4. Роути з динамічним параметром :id (мають іти ПІСЛЯ /profile)
router.get('/:id', validate(userIdSchema), getUserById);
router.patch('/:id', validate(updateUserSchema), updateUser);
router.delete('/:id', validate(userIdSchema), deleteUser);

export default router;