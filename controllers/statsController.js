import Habit from '../models/Habit.js';
import Progress from '../models/Progress.js';

export const getStats = async (req, res) => {
    try {
        // 1. Obtener hábitos con sus progresos completados
        const habits = await Habit.find({ user: req.user.id })
            .populate({
                path: 'progress',
                match: { completed: true },
                options: { sort: { date: -1 } }
            });

        if (!habits || habits.length === 0) {
            return res.status(200).json({
                success: true,
                data: {
                    message: "No hay hábitos registrados aún",
                    hasHabits: false
                }
            });
        }

        // 2. Calcular estadísticas reales basadas en progresos
        const now = new Date();
        const habitsWithStats = await Promise.all(habits.map(async (habit) => {
            const startDate = new Date(habit.start_date);
            const daysActive = Math.floor((now - startDate) / (1000 * 60 * 60 * 24)) + 1;

            // Contar progresos completados (ya poblados en el hábito)
            const completedCount = habit.progress?.length || 0;

            // Calcular expected completions según frecuencia
            let expectedCompletions;
            switch (habit.frequency) {
                case 'diario':
                    expectedCompletions = daysActive;
                    break;
                case 'semanal':
                    expectedCompletions = Math.floor(daysActive / 7);
                    break;
                case 'mensual':
                    const monthsActive = (now.getFullYear() - startDate.getFullYear()) * 12 +
                        (now.getMonth() - startDate.getMonth()) + 1;
                    expectedCompletions = monthsActive;
                    break;
                default:
                    expectedCompletions = 1;
            }

            // Calcular completionRate real
            const completionRate = expectedCompletions > 0
                ? Math.min(100, Math.round((completedCount / expectedCompletions) * 100))
                : 0;

            return {
                ...habit.toObject(),
                calculatedCompletion: completionRate,
                expectedCompletions,
                completedCount,
                daysActive
            };
        }));

        // 3. Calcular estadísticas generales
        const totalHabits = habitsWithStats.length;
        const averageCompletion = Math.round(
            habitsWithStats.reduce((sum, h) => sum + h.calculatedCompletion, 0) / totalHabits
        );

        const completedHabits = habitsWithStats.filter(h => h.calculatedCompletion >= 80).length;
        const strugglingHabits = habitsWithStats.filter(h => h.calculatedCompletion < 50).length;

        // 4. Organizar por categorías
        const categories = {};
        const categoryInfo = {
            salud: { name: 'Salud', color: '#4BC0C0' },
            aprendizaje: { name: 'Aprendizaje', color: '#9966FF' },
            productividad: { name: 'Productividad', color: '#FFCE56' },
            relaciones: { name: 'Relaciones', color: '#FF6384' },
            finanzas: { name: 'Finanzas', color: '#36A2EB' },
            espiritualidad: { name: 'Espiritualidad', color: '#8AC249' },
            creatividad: { name: 'Creatividad', color: '#EA5545' },
            hogar: { name: 'Hogar', color: '#FF9F40' }
        };

        habitsWithStats.forEach(habit => {
            const category = habit.category;
            if (!categories[category]) {
                categories[category] = {
                    name: categoryInfo[category]?.name || category,
                    color: categoryInfo[category]?.color || '#CCCCCC',
                    count: 0,
                    totalCompletion: 0,
                    habits: []
                };
            }

            categories[category].count++;
            categories[category].totalCompletion += habit.calculatedCompletion;
            categories[category].habits.push({
                name: habit.name,
                completionRate: habit.calculatedCompletion,
                streak: habit.streak || 0,
                frequency: habit.frequency
            });
        });

        // 5. Preparar datos para el gráfico - VERSIÓN CORREGIDA
        const chartData = {
            labels: [],
            datasets: [{
                data: [],
                backgroundColor: [],
                borderColor: '#ffffff',
                borderWidth: 2,
                hoverOffset: 10
            }]
        };

        // Ordenar categorías por nombre para consistencia
        const sortedCategories = Object.keys(categories).sort((a, b) =>
            categories[a].name.localeCompare(categories[b].name)
        );

        sortedCategories.forEach(category => {
            const avgCompletion = Math.round(categories[category].totalCompletion / categories[category].count);
            chartData.labels.push(categories[category].name);
            chartData.datasets[0].data.push(avgCompletion);
            chartData.datasets[0].backgroundColor.push(categories[category].color);

            // Ordenar hábitos por completionRate dentro de cada categoría
            categories[category].habits.sort((a, b) => b.completionRate - a.completionRate);
        });

        // 6. Identificar mejores/peores hábitos
        const allHabitsSorted = [...habitsWithStats]
            .map(h => ({
                name: h.name,
                category: h.category,
                completionRate: h.calculatedCompletion,
                streak: h.streak || 0,
                frequency: h.frequency
            }))
            .sort((a, b) => b.completionRate - a.completionRate);

        const bestHabits = allHabitsSorted.slice(0, 3);
        const worstHabits = allHabitsSorted.slice(-3).reverse();

        // 7. Calcular rachas
        const streaks = {
            current: Math.max(...habitsWithStats.map(h => h.streak || 0)),
            longest: Math.max(...habitsWithStats.map(h => h.streak || 0))
        };

        // 8. Enviar respuesta con estructura optimizada
        res.status(200).json({
            success: true,
            data: {
                hasHabits: true,
                summary: {
                    totalHabits,
                    averageCompletion,
                    completedHabits,
                    strugglingHabits,
                    streaks
                },
                categories,
                chartData, // Datos estructurados específicamente para Chart.js
                habitsAnalysis: {
                    bestHabits,
                    worstHabits
                },
                // Datos adicionales para depuración:
                _debug: {
                    habits: habitsWithStats.map(h => ({
                        name: h.name,
                        completionRate: h.calculatedCompletion,
                        streak: h.streak,
                        frequency: h.frequency,
                        progressCount: h.completedCount,
                        expected: h.expectedCompletions
                    }))
                }
            }
        });

    } catch (err) {
        console.error('Error en getStats:', err);
        res.status(500).json({
            success: false,
            message: 'Error al obtener estadísticas',
            error: err.message,
            _debug: process.env.NODE_ENV === 'development' ? {
                errorStack: err.stack
            } : undefined
        });
    }
};

export const getHabitHistory = async (req, res) => {
    try {
        const habit = await Habit.findById(req.params.id)
            .populate({
                path: 'progress',
                options: {
                    sort: { date: -1 },
                    limit: 30 // Limitar a los últimos 30 registros
                }
            });

        if (!habit) {
            return res.status(404).json({
                success: false,
                message: 'Hábito no encontrado'
            });
        }

        // Procesar historial para respuesta
        const history = (habit.progress || []).map(p => ({
            date: p.date,
            completed: p.completed,
            notes: p.notes,
            _id: p._id
        }));

        res.json({
            success: true,
            data: {
                habit: {
                    name: habit.name,
                    category: habit.category,
                    streak: habit.streak || 0,
                    completionRate: habit.completionRate || 0
                },
                history
            }
        });

    } catch (err) {
        console.error('Error en getHabitHistory:', err);
        res.status(500).json({
            success: false,
            message: 'Error al obtener historial',
            error: err.message
        });
    }
};
