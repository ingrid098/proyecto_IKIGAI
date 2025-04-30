import express from 'express';
import {
    createHabit,
    getHabits,
    updateHabit,
    logProgress,
    deleteHabit,
} from '../controllers/habitController.js';
import protect from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, createHabit);
router.get('/', protect, getHabits);
router.put('/:id', protect, updateHabit);
router.post('/:id/progress', protect, logProgress);
router.delete('/:id', protect, deleteHabit);

export default router;
