const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const env = require('./config/env');
const authRoutes = require('./routes/auth.routes');
const leadRoutes = require('./routes/lead.routes');
const errorHandler = require('./middlewares/error.middleware');

const app = express();

// Global Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  cors({
    origin: [
      env.CLIENT_URL,
      "http://localhost:5173",
    ],
    credentials: true,
  })
);

// Basic health check route
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    environment: env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/leads', leadRoutes);

// Global Error Handling Middleware
app.use(errorHandler);

module.exports = app;
