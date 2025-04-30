import Habit from '../models/Habit.js';
import Progress from '../models/Progress.js';

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

// Registrar progreso de un hábito
export const logProgress = async (req, res) => {
    try {
        const { date, completed, notes } = req.body;

        // 1. Registrar el progreso
        const progress = await Progress.create({
            habit: req.params.id,
            date: date || new Date(),
            completed: completed === true || completed === 'true',
            notes
        });

        // 2. Actualizar el hábito
        const habit = await Habit.findById(req.params.id);
        if (!habit) {
            return res.status(404).json({ message: 'Hábito no encontrado' });
        }

        // Actualizar racha
        if (completed) {
            habit.streak = (habit.streak || 0) + 1;
        } else {
            habit.streak = 0;
        }

        // Calcular nuevo completionRate
        const now = new Date();
        const startDate = new Date(habit.start_date);
        const daysActive = Math.floor((now - startDate) / (1000 * 60 * 60 * 24)) + 1;

        // Contar TODOS los progresos completados de este hábito
        const completedCount = await Progress.countDocuments({
            habit: habit._id,
            completed: true
        });

        // Calcular expected según frecuencia
        let expected;
        switch (habit.frequency) {
            case 'diario':
                expected = daysActive;
                break;
            case 'semanal':
                expected = Math.floor(daysActive / 7);
                break;
            case 'mensual':
                expected = (now.getFullYear() - startDate.getFullYear()) * 12 +
                    (now.getMonth() - startDate.getMonth()) + 1;
                break;
            default:
                expected = 1;
        }

        habit.completionRate = Math.min(100, Math.round((completedCount / Math.max(1, expected)) * 100));

        // Guardar referencia al progreso en el hábito
        habit.progress = habit.progress || [];
        habit.progress.push(progress._id);

        await habit.save();

        res.json({
            success: true,
            data: {
                habit,
                progress
            }
        });

    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Error al registrar progreso',
            error: err.message
        });
    }
};

// Eliminar un hábito
export const deleteHabit = async (req, res) => {
    try {
        const habit = await Habit.findOneAndDelete({
            _id: req.params.id,
            user: req.user.id
        });

        if (!habit) {
            return res.status(404).json({ message: 'Hábito no encontrado' });
        }

        res.json({
            success: true,
            message: 'Hábito eliminado exitosamente'
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Error al eliminar el hábito',
            error: err.message
        });
    }
};
