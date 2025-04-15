import User from '../models/User.js';
import jwt from 'jsonwebtoken';

// Función para generar token JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'secretkey', {
        expiresIn: '30d'
    });
};

// Registrar un nuevo usuario
export const register = async (req, res) => {
    const { username, password } = req.body;

    try {
        // Verificar si el usuario ya existe
        const userExists = await User.findOne({ username });
        if (userExists) {
            return res.status(400).json({ message: 'El usuario ya existe' });
        }

        // Crear nuevo usuario
        const user = await User.create({ username, password });

        if (user) {
            res.status(201).json({
                _id: user._id,
                username: user.username,
                token: generateToken(user._id)
            });
        } else {
            res.status(400).json({ message: 'Datos de usuario inválidos' });
        }
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Autenticar usuario
export const login = async (req, res) => {
    const { username, password } = req.body;

    try {
        // Buscar usuario por nombre de usuario
        const user = await User.findOne({ username });

        // Verificar usuario y contraseña
        if (user && (await user.comparePassword(password))) {
            res.json({
                _id: user._id,
                username: user.username,
                token: generateToken(user._id)
            });
        } else {
            res.status(401).json({ message: 'Usuario o contraseña incorrectos' });
        }
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};