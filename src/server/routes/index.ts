import { Router } from 'express';
import authRoutes from './authRoutes';
import staffRoutes from './staffRoutes';
import victimRoutes from './victimRoutes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/', staffRoutes);
router.use('/victim', victimRoutes);

export { authRoutes, staffRoutes, victimRoutes };
export default router;
