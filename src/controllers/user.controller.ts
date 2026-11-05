import { Request, Response } from 'express';
import { userService } from '../services/user.service';
import { catchAsync } from '../utils/catchAsync';

export interface AuthRequest extends Request {
  userId?: string;
}

// 1. Створення користувача (підтримка JSON та файлу photo)
export const createUser = catchAsync(async (req: Request, res: Response) => {
  const userData = { ...req.body };

  if (req.file) {
    userData.photo = `/uploads/${req.file.filename}`;
  }

  const user = await userService.createUser(userData);
  res.status(201).json({
    success: true,
    data: user,
  });
});

// 2. Отримання списку користувачів
export const getUsers = catchAsync(async (req: Request, res: Response) => {
  const page = Math.max(1, Math.floor(Number(req.query.page)) || 1);
  const limit = Math.min(100, Math.max(1, Math.floor(Number(req.query.limit)) || 10));
  const search = typeof req.query.search === 'string' ? req.query.search : undefined;

  const result = await userService.getUsers({ search }, { page, limit });

  res.status(200).json({
    success: true,
    data: result.items,
    meta: {
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    },
  });
});

// 3. Отримання користувача за ID
export const getUserById = catchAsync(async (req: Request, res: Response) => {
  const user = await userService.getUserById(req.params.id);
  res.status(200).json({
    success: true,
    data: user,
  });
});

// 4. Адмін-оновлення користувача за ID
export const updateUser = catchAsync(async (req: Request, res: Response) => {
  const user = await userService.updateUser(req.params.id, req.body);
  res.status(200).json({
    success: true,
    data: user,
  });
});

// 5. Оновлення власного профілю авторизованого користувача (з підтримкою фото)
export const updateProfile = catchAsync(async (req: AuthRequest, res: Response) => {
  const userId = req.userId!;
  const updateData = { ...req.body };

  if (req.file) {
    updateData.photo = `/uploads/${req.file.filename}`;
  }

  const user = await userService.updateUser(userId, updateData);

  res.status(200).json({
    success: true,
    message: 'Profile updated successfully',
    data: user,
  });
});

// 6. Видалення користувача за ID
export const deleteUser = catchAsync(async (req: Request, res: Response) => {
  await userService.deleteUser(req.params.id);
  res.status(204).send();
});