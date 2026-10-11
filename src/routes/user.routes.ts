import { Router } from 'express';
import {
  createUser,
  deleteUser,
  getUserById,
  getUsers,
  updateUser,
} from '../controllers/user.controller';
import { validate } from '../middlewares/validate';
import { createUserSchema, updateUserSchema, userIdSchema } from '../validations/user.validation';

const router = Router();

router.post('/', validate(createUserSchema), createUser);
router.get('/', getUsers);
router.get('/:id', validate(userIdSchema), getUserById);
router.patch('/:id', validate(updateUserSchema), updateUser);
router.delete('/:id', validate(userIdSchema), deleteUser);

export default router;
