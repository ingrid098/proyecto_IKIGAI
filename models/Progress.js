import mongoose from 'mongoose';

const progressSchema = new mongoose.Schema({
    habit: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Habit',
        required: true
    },
    date: {
        type: Date,
        required: true,
        default: Date.now
    },
    completed: {
        type: Boolean,
        required: true
    },
    notes: {
        type: String
    }
}, {
    timestamps: true
});

const Progress = mongoose.model('Progress', progressSchema);

export default Progress;
