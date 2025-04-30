import User from '../models/User.js';
import jwt from 'jsonwebtoken';

// generar token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'secretkey', { expiresIn: '30d' });
};

// Registrar un nuevo usuario
export const register = async (req, res) => {
    const { name, documentId, phone, username, password, gender, birthdate } = req.body;

    try {
        // Verificar si el usuario ya existe
        const userExists = await User.findOne({ username });
        if (userExists) {
            return res.status(400).json({ message: 'El usuario ya existe' });
        }

        // Crear un nuevo usuario
        const user = await User.create({
            name,
            documentId,
            phone,
            username,
            password,
            gender,
            birthdate: new Date(birthdate)
        });

        res.status(201).json({
            success: true,
            message: 'Usuario registrado con éxito',
            data: {
                _id: user._id,
                name: user.name,
                username: user.username,
                token: generateToken(user._id)
            }
        });
    } catch (err) {
        console.error('Error en registro:', err);
        res.status(500).json({
            success: false,
            message: 'Error en el servidor',
            error: err.message
        });
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
                name: user.name,
                username: user.username,
                token: generateToken(user._id)
            });
        } else {
            res.status(401).json({ message: 'Usuario o contraseña incorrecta' });
        }
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
