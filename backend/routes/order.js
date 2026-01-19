import { Router } from 'express';
import {
  createOrder,
  getUserOrders,
  estimateDeliveryDetails,
  getAllOrdersForAdmin,
  markCodPaymentSettled,
} from '../controllers/orderController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = Router();

router.post('/', protect, createOrder);
router.get('/', protect, getUserOrders);
router.post('/estimate-delivery', protect, estimateDeliveryDetails);
router.get('/admin', protect, admin, getAllOrdersForAdmin);
router.patch('/admin/:orderId/cod-settle', protect, admin, markCodPaymentSettled);

export default router;
