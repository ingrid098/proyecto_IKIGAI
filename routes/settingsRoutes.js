import express from 'express';
import {
    getUserInfo,
    updateUserInfo,
    changePassword
} from '../controllers/settingsController.js';
import protect from '../middleware/authMiddleware.js';

const router = express.Router();

// Rutas corregidas - eliminamos el prefijo duplicado
router.get('/info', protect, getUserInfo);          // GET /api/settings/info
router.put('/update', protect, updateUserInfo);     // PUT /api/settings/update
router.put('/password', protect, changePassword);   // PUT /api/settings/password

export default router;