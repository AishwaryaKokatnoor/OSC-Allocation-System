import { Router } from 'express';
import { AuthController } from '../controllers';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Staff Login
router.post('/login', AuthController.login);

// Staff Registration (support /register and /register-staff)
router.post('/register', AuthController.register);
router.post('/register-staff', AuthController.register);

// Authenticated User Profile
router.get('/me', authenticateToken, AuthController.getMe);

export default router;
