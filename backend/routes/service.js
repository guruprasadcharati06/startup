import { Router } from 'express';
import {
  getServices,
  createService,
  updateService,
  deleteService,
} from '../controllers/serviceController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/', getServices);
router.post('/', protect, admin, createService);
router.put('/:id', protect, admin, updateService);
router.delete('/:id', protect, admin, deleteService);

export default router;
