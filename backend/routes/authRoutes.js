import { Router } from 'express';
import { currentUser, login, register } from '../controllers/authController.js';
import { requireDatabase } from '../controllers/dbGuard.js';
import { requireAuth } from '../controllers/requireAuth.js';

const router = Router();
router.use(requireDatabase);
router.post('/register', register);
router.post('/login', login);
router.get('/me', requireAuth, currentUser);
export default router;
