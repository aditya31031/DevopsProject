const mongoose = require('mongoose');
const logger = require('../utils/logger');

const connectDB = async () => {
    // In test mode, the test suite manages its own in-memory connection
    if (process.env.NODE_ENV === 'test') return;

    try {
        const uri = process.env.MONGO_URI;
        const conn = await mongoose.connect(uri);
        logger.info(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        logger.error(`MongoDB connection error: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;
