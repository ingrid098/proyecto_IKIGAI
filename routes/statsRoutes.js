import express from 'express';
import { getStats, getHabitHistory } from '../controllers/statsController.js';
import protect from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, getStats);
router.get('/:id/history', protect, getHabitHistory);

export default router
