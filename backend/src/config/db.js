const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB подключена: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Ошибка при подключении к MongoDB: ${error.message}`);
        process.exit(1); // Остановить сервер при ошибке
    }
};

module.exports = connectDB;