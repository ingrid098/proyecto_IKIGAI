// middleware/authMiddleware.js
import jwt from 'jsonwebtoken';

const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secretkey');
            req.user = { id: decoded.id };
            next();
        } catch (error) {
            console.error('Error verifying token:', error);
            res.status(401).json({ message: 'Token no válido' });
        }
    }

    if (!token) {
        res.status(401).json({ message: 'No autorizado, no hay token' });
    }
};

export default protect;
