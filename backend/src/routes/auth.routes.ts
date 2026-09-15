import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.post('/login', AuthController.login);
router.get('/profile', requireAuth, AuthController.getProfile);

export default router;
