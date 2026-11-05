import { IUser } from '../models/user.model';
import { UserFilter, userRepository } from '../repositories/user.repository';
import { ApiError } from '../utils/ApiError';
import { CreateUserInput, UpdateUserInput } from '../validations/user.validation';

export interface PaginationOptions {
  page: number;
  limit: number;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

async function createUser(input: CreateUserInput & { photo?: string }): Promise<IUser> {
  const existing = await userRepository.findByEmail(input.email);
  if (existing) {
    throw ApiError.conflict('User with this email already exists');
  }

  return userRepository.create(input);
}

async function getUsers(
  filter: UserFilter,
  pagination: PaginationOptions,
): Promise<PaginatedResult<IUser>> {
  const { page, limit } = pagination;
  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    userRepository.findMany(filter, skip, limit),
    userRepository.count(filter),
  ]);

  return {
    items,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit) || 1,
  };
}

async function getUserById(id: string): Promise<IUser> {
  const user = await userRepository.findById(id);
  if (!user) {
    throw ApiError.notFound('User not found');
  }
  return user;
}

async function updateUser(id: string, input: UpdateUserInput): Promise<IUser> {
  if (input.email) {
    const existing = await userRepository.findByEmailExcludingId(input.email, id);
    if (existing) {
      throw ApiError.conflict('User with this email already exists');
    }
  }

  const user = await userRepository.updateById(id, input);
  if (!user) {
    throw ApiError.notFound('User not found');
  }

  return user;
}

async function deleteUser(id: string): Promise<void> {
  const user = await userRepository.deleteById(id);
  if (!user) {
    throw ApiError.notFound('User not found');
  }
}

export const userService = {
  createUser,
  getUsers,
  getUserById,
  updateUser,
  updateProfile: updateUser, // Додано як зручний alias для контролера профілю
  deleteUser,
};