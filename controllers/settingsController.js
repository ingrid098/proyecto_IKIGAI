import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import validator from 'validator';

// Obtener información del usuario
export const getUserInfo = async (req, res) => {
    try {
        const user = await User.findById(req.user.id)
            .select('-password -resetPasswordToken -resetPasswordExpire')
            .lean();

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }

        // Formatear fecha de nacimiento para el frontend
        if (user.birthdate) {
            user.birthdate = user.birthdate.toISOString().split('T')[0];
        }

        res.json({
            success: true,
            data: user
        });
    } catch (err) {
        console.error('Error en getUserInfo:', err);
        res.status(500).json({
            success: false,
            message: 'Error al obtener información del usuario',
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
};

// Validación de datos de usuario
const validateUserData = (data) => {
    const errors = {};

    if (!data.name || data.name.trim().length < 2) {
        errors.name = 'El nombre debe tener al menos 2 caracteres';
    }

    if (!data.username || data.username.trim().length < 4) {
        errors.username = 'El username debe tener al menos 4 caracteres';
    }

    if (data.documentId && !/^[a-zA-Z0-9]{6,20}$/.test(data.documentId)) {
        errors.documentId = 'Documento no válido';
    }

    if (data.phone && !validator.isMobilePhone(data.phone, 'es-CO')) {
        errors.phone = 'Teléfono no válido';
    }

    if (data.birthdate) {
        const birthDate = new Date(data.birthdate);
        const ageDiff = Date.now() - birthDate.getTime();
        const ageDate = new Date(ageDiff);
        const age = Math.abs(ageDate.getUTCFullYear() - 1970);

        if (isNaN(birthDate.getTime()) || age < 13) {
            errors.birthdate = 'Debes tener al menos 13 años';
        }
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
};

// Actualizar información del usuario
export const updateUserInfo = async (req, res) => {
    try {
        const { name, username, documentId, phone, gender, birthdate } = req.body;

        // Validación manual (sin librerías)

        if (!name || !username) {
            return res.status(400).json({
                success: false,
                message: "Nombre y username son requeridos"
            });
        }


        // Validación de género
        const validGenders = ['masculino', 'femenino', 'otro'];
        if (gender && !validGenders.includes(gender)) {
            return res.status(400).json({
                success: false,
                message: `Género no válido. Use: ${validGenders.join(', ')}`,
                errorType: "gender"
            });
        }



        const updatedUser = await User.findByIdAndUpdate(
            req.user.id,
            {
                name: name.trim(),
                username: username.trim(),
                documentId: documentId?.trim(),
                phone: phone?.trim(),
                gender,
                birthdate: birthdate || null
            },
            { new: true, runValidators: true }
        ).select('-password');

        if (!updatedUser) {
            return res.status(404).json({ success: false, message: "Usuario no encontrado" });
        }
        res.json({
            success: true,
            message: "Datos actualizados",
            data: updatedUser
        });


        res.json({
            success: true,
            data: updatedUser
        });


    } catch (err) {
        console.error('Error en updateUserInfo:', err);

        // Manejo específico de errores de Mongoose
        if (err.name === 'ValidationError') {
            const errors = {};
            Object.keys(err.errors).forEach(key => {
                errors[key] = err.errors[key].message;
            });
            return res.status(400).json({
                success: false,
                message: "Error de validación",
                errors
            });
        }

        // Error genérico
        res.status(500).json({
            success: false,
            message: "Error del servidor"
        });
    }
};

// Cambiar contraseña
export const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const user = await User.findById(req.user.id);

        // Validaciones manuales
        if (!(await user.comparePassword(currentPassword))) {
            return res.status(401).json({
                success: false,
                message: "Contraseña actual incorrecta"
            });
        }

        if (newPassword.length < 8) {
            return res.status(400).json({
                success: false,
                message: "La nueva contraseña debe tener al menos 8 caracteres",
                errors: { newPassword: "Mínimo 8 caracteres" }
            });
        }

        user.password = newPassword;
        await user.save();

        res.json({
            success: true,
            message: "Contraseña actualizada"
        });

    } catch (err) {
        res.status(500).json({
            success: false,
            message: "Error al cambiar contraseña",
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
};
