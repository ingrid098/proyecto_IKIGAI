import express from 'express';
import { register, login } from '../controllers/authController.js';

const router = express.Router();

// Ruta para registro de usuarios
router.post('/register', register);

// Ruta para inicio de sesión
router.post('/login', login);

export default router;
