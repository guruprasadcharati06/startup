import { Router } from 'express';
import { protect, admin } from '../middleware/authMiddleware.js';
import { getProfile, updateProfile, getRecentSignupsForAdmin } from '../controllers/userController.js';

const router = Router();

router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.get('/admin/recent-signups', protect, admin, getRecentSignupsForAdmin);

export default router;
