import { Router } from 'express';
import {
  createSubscription,
  getMySubscription,
  getAllSubscriptions,
  markDeliveryDelivered,
} from '../controllers/subscriptionController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/my', protect, getMySubscription);
router.post('/create', protect, createSubscription);

router.get('/admin', protect, admin, getAllSubscriptions);
router.post('/admin/:subscriptionId/deliveries/:dayIndex/delivered', protect, admin, markDeliveryDelivered);

export default router;
