import mongoose from 'mongoose';

const habitSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    category: {
        type: String,
        required: true,
        enum: ['salud', 'aprendizaje', 'productividad', 'relaciones', 'finanzas', 'espiritualidad', 'creatividad', 'hogar']
    },
    frequency: {
        type: String,
        required: true,
        enum: ['diario', 'semanal', 'mensual']
    },
    goal: {
        type: String
    },
    start_date: {
        type: Date,
        required: true
    },
    streak: {
        type: Number,
        default: 0
    },
    completionRate: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
    },

    progress: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Progress'
    }]

}, {
    timestamps: true
});

const Habit = mongoose.model('Habit', habitSchema);

export default Habit;
