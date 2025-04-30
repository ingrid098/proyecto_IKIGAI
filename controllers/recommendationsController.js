import Habit from '../models/Habit.js';

export const getRecommendations = async (req, res) => {
    try {
        const userId = req.user.id;

        // 1. Obtener hábitos del usuario con bajo completionRate
        const strugglingHabits = await Habit.find({
            user: userId,
            completionRate: { $lt: 50 } // Hábitos con menos del 50% de cumplimiento
        }).limit(5);

        // 2. Recomendaciones genéricas (puedes usar una DB o array)
        const genericRecommendations = [
            {
                title: "Hidratación",
                description: "Bebe 8 vasos de agua al día",
                image: "water.png",
                category: "salud"
            },
            {
                title: "Lectura",
                description: "Lee 20 minutos diarios",
                image: "book.png",
                category: "aprendizaje"
            }
        ];

        // 3. Combinar recomendaciones personalizadas + genéricas
        const personalized = strugglingHabits.map(habit => ({
            title: `Mejora tu hábito: ${habit.name}`,
            description: `Intenta cumplir este hábito ${habit.frequency}`,
            image: `${habit.category}.png`,
            category: habit.category
        }));

        res.json({
            success: true,
            data: [...personalized, ...genericRecommendations]
        });

    } catch (err) {
        res.status(500).json({
            success: false,
            message: "Error al obtener recomendaciones"
        });
    }
};