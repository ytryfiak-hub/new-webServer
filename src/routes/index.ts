import { Router } from 'express';
import userRoutes from './user.routes';

const router = Router();

router.get('/health', (_req, res) => {
  res.status(200).json({ success: true, message: 'API is up and running' });
});

router.use('/users', userRoutes);

export default router;
