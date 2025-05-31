/**
 * Main application server setup
 * @module server
 */

// Core dependencies
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

// Configuration imports
const connectDB = require("./config/database");
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');

// Load environment variables
dotenv.config();

// Initialize database connection
connectDB();

// Initialize Express app
const app = express();

/**
 * CORS Configuration
 * Allows specified origins and methods
 */
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin'
  ],
  credentials: true,
  maxAge: 86400 // 24 hours
}));

// Handle preflight requests
app.options('*', cors());

/**
 * Middleware Configuration
 */
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

/**
 * API Routes Configuration
 */
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/shifts", require("./routes/shiftRoutes"));
app.use("/api/attendance", require("./routes/attendanceRoutes"));
app.use("/api/leaves", require("./routes/leaveRoutes"));

/**
 * Base route handler
 * @route GET /
 */
app.get("/", (req, res) => {
  res.json({
    message: "Welcome to HCL Healthcare Backend API",
    version: "1.0.0",
    docs: "/api-docs"
  });
});

/**
 * Health check endpoint
 * @route GET /health
 */
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || "development",
    message: "System operational"
  });
});

/**
 * Global Error Handler
 */
app.use((err, req, res, next) => {
  // Log error details
  console.error('❌ Error details:', {
    message: err.message,
    stack: err.stack,
    timestamp: new Date().toISOString(),
    path: req.path,
    method: req.method,
  });

  // Handle specific error types
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Validation Error',
      errors: Object.values(err.errors).map(error => error.message)
    });
  }

  if (err.code === 11000) {
    return res.status(400).json({
      success: false,
      message: 'Duplicate field value entered',
      field: Object.keys(err.keyPattern)[0]
    });
  }

  // Default error response
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && {
      error: err,
      stack: err.stack
    })
  });
});

/**
 * 404 Route Handler
 */
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "Endpoint not found"
  });
});

// Server Configuration
const PORT = process.env.PORT || 3000;

// Start server
app.listen(PORT, () => {
  console.log(`✨ Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`🚀 API Base URL: http://localhost:${PORT}`);
  console.log(`📚 API Documentation: http://localhost:${PORT}/api-docs`);
});
