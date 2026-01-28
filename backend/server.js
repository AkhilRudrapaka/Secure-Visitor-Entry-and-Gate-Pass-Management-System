require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const connectDB = require('./src/config/db');

// Import Routes
const authRoutes = require('./src/routes/auth.routes');
const visitorRoutes = require('./src/routes/visitor.routes');
const gatePassRoutes = require('./src/routes/gatepass.routes');
const adminRoutes = require('./src/routes/admin.routes');

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan('dev'));

// Security Headers
app.use(helmet());

// CORS Configuration
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:5174'], // Vite default port & backup
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Connect to Database
connectDB();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/visitors', visitorRoutes);
app.use('/api/gatepass', gatePassRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/users', require('./src/routes/user.routes'));


// Health Check
app.get('/', (req, res) => {
    res.status(200).json({ status: 'OK', message: 'Secure Gate Pass API is running' });
});

// Error Handling Middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    const status = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';
    res.status(status).json({ success: false, message });
});

const PORT = process.env.PORT || 5000;

if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
    });
}

module.exports = app;
