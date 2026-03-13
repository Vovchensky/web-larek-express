import { Router } from 'express';
import {
  register, login, refreshAccessToken, logout, getCurrentUser,
} from '../controllers/auth';
import { validateRegister, validateLogin } from '../middlewares/validation';
import authMiddleware from '../middlewares/auth';

const router = Router();

router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);
router.get('/token', refreshAccessToken);
router.get('/logout', logout);
router.get('/user', authMiddleware, getCurrentUser);

export default router;
