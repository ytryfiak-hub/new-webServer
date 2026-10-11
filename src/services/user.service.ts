import { FilterQuery } from 'mongoose';
import { IUserDocument, UserModel } from '../models/user.model';
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

async function createUser(input: CreateUserInput): Promise<IUserDocument> {
  const existing = await UserModel.findOne({ email: input.email });
  if (existing) {
    throw ApiError.conflict('User with this email already exists');
  }

  return UserModel.create(input);
}

async function getUsers(
  filter: FilterQuery<IUserDocument>,
  pagination: PaginationOptions,
): Promise<PaginatedResult<IUserDocument>> {
  const { page, limit } = pagination;
  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    UserModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    UserModel.countDocuments(filter),
  ]);

  return {
    items,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit) || 1,
  };
}

async function getUserById(id: string): Promise<IUserDocument> {
  const user = await UserModel.findById(id);
  if (!user) {
    throw ApiError.notFound('User not found');
  }
  return user;
}

async function updateUser(id: string, input: UpdateUserInput): Promise<IUserDocument> {
  if (input.email) {
    const existing = await UserModel.findOne({ email: input.email, _id: { $ne: id } });
    if (existing) {
      throw ApiError.conflict('User with this email already exists');
    }
  }

  const user = await UserModel.findByIdAndUpdate(
    id,
    { $set: input },
    { new: true, runValidators: true },
  );

  if (!user) {
    throw ApiError.notFound('User not found');
  }

  return user;
}

async function deleteUser(id: string): Promise<void> {
  const user = await UserModel.findByIdAndDelete(id);
  if (!user) {
    throw ApiError.notFound('User not found');
  }
}

export const userService = {
  createUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
};
