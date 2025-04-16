import mongoose from 'mongoose';

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ikigai_db', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log(`MongoDB conectado: ${conn.connection.host}`);
    } catch (err) {
        console.error('Error de conexión a MongoDB:', err.message);
        process.exit(1);
    }
};

export default connectDB;