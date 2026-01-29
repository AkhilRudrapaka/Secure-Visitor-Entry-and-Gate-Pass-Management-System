const mongoose = require('mongoose');

let isConnected = false; // Track connection status

const connectDB = async () => {
    if (isConnected) {
        console.log('Using existing MongoDB connection');
        return;
    }

    try {
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            dbName: 'secure_gate_pass' // Optional: Specify DB name if needed, or rely on URI
        });
        
        isConnected = true;
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        // Do not exit process in serverless environment
        throw error;
    }
};

module.exports = connectDB;
