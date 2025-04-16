import Habit from '../models/Habit.js';

// Crear un nuevo hábito
export const createHabit = async (req, res) => {
    try {
        const { name, description, category, frequency, goal, start_date } = req.body;

        const habit = await Habit.create({
            user: req.user.id,
            name,
            description,
            category,
            frequency,
            goal,
            start_date
        });

        res.status(201).json({
            success: true,
            data: habit
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Error al crear el hábito',
            error: err.message
        });
    }
};

// Obtener habitos del usuario
export const getHabits = async (req, res) => {
    try {
        const habits = await Habit.find({ user: req.user.id });
        res.json({
            success: true,
            data: habits
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener hábitos',
            error: err.message
        });
    }
};

// Actualizar un hábito existente
export const updateHabit = async (req, res) => {
    try {
        const { name, description, category, frequency, goal } = req.body;

        const habit = await Habit.findOneAndUpdate(
            { _id: req.params.id, user: req.user.id },
            { name, description, category, frequency, goal },
            { new: true }
        );

        if (!habit) {
            return res.status(404).json({ message: 'Hábito no encontrado' });
        }

        res.json({
            success: true,
            data: habit
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Error al actualizar el hábito',
            error: err.message
        });
    }
};

// Registrar progreso de un habito
export const logProgress = async (req, res) => {
    try {
        const { date, completed, notes } = req.body;

        // 1. Crear registro de progreso (necesitarías un modelo Progress)
        // 2. Actualizar racha y porcentaje de completado

        const habit = await Habit.findById(req.params.id);
        if (!habit) {
            return res.status(404).json({ message: 'Hábito no encontrado' });
        }

        if (completed) {
            habit.streak += 1;
            // Logica para calcular completionRate según la frecuencia
        } else {
            habit.streak = 0;
        }

        await habit.save();

        res.json({
            success: true,
            data: habit
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Error al registrar progreso',
            error: err.message
        });
    }
};