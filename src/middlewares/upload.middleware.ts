import fs from 'fs';
import path from 'path';
import multer from 'multer';
import { ApiError } from '../utils/ApiError';

// Автоматично створюємо папку /uploads в корені проєкту, якщо її ще немає
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Налаштування збереження файлу на диск
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    // Унікальне ім'я файлу (наприклад: avatar-1710000000000-123456789.jpg)
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `avatar-${uniqueSuffix}${ext}`);
  },
});

// Фільтр: дозволяємо завантажувати лише зображення
const fileFilter = (
  _req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback,
) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new ApiError(400, 'Дозволено завантажувати лише зображення (jpeg, png, webp тощо)'));
  }
};

export const uploadPhoto = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // Обмеження розміру файлу: 5 МБ
  },
});