# Express User CRUD API

REST API для CRUD-операцій над користувачами.
Стек: **Express + TypeScript + PostgreSQL (Drizzle ORM) + ESLint + Prettier**.

## 📁 Структура проекту

```
express-user-crud/
├── src/
│   ├── config/           # Конфігурація (env, підключення до БД)
│   │   ├── env.ts
│   │   └── database.ts
│   ├── controllers/      # Обробники HTTP запитів
│   │   └── user.controller.ts
│   ├── db/               # Drizzle-схема таблиць
│   │   └── schema.ts
│   ├── repositories/     # Запити до БД через Drizzle
│   │   └── user.repository.ts
│   ├── models/           # Типи користувача (виводяться зі схеми)
│   │   └── user.model.ts
│   ├── routes/           # Express роутери
│   │   ├── index.ts
│   │   └── user.routes.ts
│   ├── services/         # Бізнес-логіка / робота з БД
│   │   └── user.service.ts
│   ├── middlewares/       # Express middlewares
│   │   ├── errorHandler.ts
│   │   ├── notFound.ts
│   │   └── validate.ts
│   ├── validations/      # Zod-схеми валідації
│   │   └── user.validation.ts
│   ├── utils/             # Допоміжні класи/функції
│   │   ├── ApiError.ts
│   │   └── catchAsync.ts
│   ├── app.ts             # Налаштування Express застосунку
│   └── server.ts          # Точка входу (запуск сервера + БД)
├── .env.example
├── .eslintrc / eslint.config.js
├── .prettierrc
├── tsconfig.json
└── package.json
```

## 🚀 Запуск проекту

### 1. Встановити залежності

```bash
npm install
```

### 2. Налаштувати змінні середовища

```bash
cp .env.example .env
```

Відредагуйте `.env` за потреби:

```
NODE_ENV=development
PORT=5000
DATABASE_URL=postgres://postgres:postgres@127.0.0.1:5432/user_crud_db
```

### 3. Запустити PostgreSQL

Локально (потрібен PostgreSQL 13+), у хмарі (наприклад, Neon) або через Docker. Міграції з папки `drizzle/` застосовуються автоматично при старті сервера.

```bash
docker run -d -p 5432:5432 --name postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=user_crud_db postgres:17
```

### 4. Запустити застосунок у режимі розробки

```bash
npm run dev
```

Сервер підніметься на `http://localhost:5000`.

### 5. Білд і продакшн запуск

```bash
npm run build
npm start
```

## 🗄️ База даних (Drizzle)

Схема описана в `src/db/schema.ts`. Після зміни схеми:

```bash
npm run db:generate   # згенерувати SQL-міграцію в drizzle/
npm run db:migrate    # застосувати міграції (або просто перезапустити сервер)
npm run db:studio     # веб-інтерфейс для перегляду даних
```

## 🧹 Лінтинг і форматування

```bash
npm run lint          # перевірка ESLint
npm run lint:fix       # автоматичне виправлення
npm run format         # форматування Prettier
npm run format:check   # перевірка форматування
```

## 📚 API Ендпоінти

Базовий шлях: `/api`

| Метод  | Ендпоінт          | Опис                              |
|--------|-------------------|------------------------------------|
| GET    | `/health`         | Перевірка стану API                |
| POST   | `/users`          | Створити користувача                |
| GET    | `/users`          | Отримати список (пагінація, пошук) |
| GET    | `/users/:id`      | Отримати користувача за ID          |
| PATCH  | `/users/:id`      | Оновити користувача                 |
| DELETE | `/users/:id`      | Видалити користувача                |

### Приклад створення користувача

```bash
curl -X POST http://localhost:5000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Іван Петренко",
    "email": "ivan@example.com",
    "password": "secret123",
    "age": 28
  }'
```

### Приклад отримання списку з пагінацією та пошуком

```bash
curl "http://localhost:5000/api/users?page=1&limit=10&search=ivan"
```

## 🛡️ Обробка помилок

Усі помилки повертаються у форматі:

```json
{
  "success": false,
  "message": "User not found"
}
```

У режимі `development` додатково повертається `stack` трейс.
