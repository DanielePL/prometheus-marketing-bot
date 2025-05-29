// server/src/index.js - KOMPLETTER CODE
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import compression from 'compression';

// Database connection
import connectDB from './config/database.js';

// Routes
import authRoutes from './routes/auth.js';
import campaignRoutes from './routes/campaigns.js';
// Weitere Routes können hier importiert werden:
// import productRoutes from './routes/products.js';
// import marketIntelRoutes from './routes/market-intelligence.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// =============================================================================
// MIDDLEWARE CONFIGURATION
// =============================================================================

// Security middleware
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// Compression middleware
app.use(compression());

// Rate limiting - mehr Requests für Production
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 Minuten
  max: process.env.NODE_ENV === 'production' ? 200 : 100, // Limit pro IP
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// CORS configuration - erweitert für Production
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      process.env.FRONTEND_URL,
      'http://localhost:3000',
      'http://localhost:3001'
    ].filter(Boolean);

    // Allow requests with no origin (mobile apps, etc.)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Preflight requests

// Body parsing middleware
app.use(express.json({
  limit: '10mb',
  verify: (req, res, buf) => {
    try {
      JSON.parse(buf);
    } catch (e) {
      res.status(400).json({ error: 'Invalid JSON' });
      throw new Error('Invalid JSON');
    }
  }
}));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware (nur in Development detailliert)
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    if (req.body && Object.keys(req.body).length > 0 && !req.path.includes('auth')) {
      console.log('Body:', JSON.stringify(req.body, null, 2));
    }
    next();
  });
} else {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path} - ${req.ip}`);
    next();
  });
}

// =============================================================================
// API ROUTES
// =============================================================================

// Health check endpoint - erweitert
app.get('/health', async (req, res) => {
  try {
    // Check database connection
    const dbStatus = await import('mongoose').then(mongoose =>
      mongoose.default.connection.readyState === 1 ? 'connected' : 'disconnected'
    );

    res.json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      database: dbStatus,
      uptime: process.uptime(),
      memory: process.memoryUsage()
    });
  } catch (error) {
    res.status(503).json({
      status: 'ERROR',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});

// API info endpoint
app.get('/api', (req, res) => {
  res.json({
    name: 'Prometheus API',
    version: '1.0.0',
    description: 'AI-powered marketing intelligence platform',
    endpoints: {
      auth: '/api/auth',
      campaigns: '/api/campaigns',
      health: '/health'
    }
  });
});

// Authentication routes
app.use('/api/auth', authRoutes);

// Campaign routes
app.use('/api/campaigns', campaignRoutes);

// TODO: Uncomment when routes are implemented
// app.use('/api/products', productRoutes);
// app.use('/api/market-intelligence', marketIntelRoutes);

// =============================================================================
// ERROR HANDLING
// =============================================================================

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
    timestamp: new Date().toISOString()
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('❌ Global Error Handler:', error);

  // Mongoose validation errors
  if (error.name === 'ValidationError') {
    const errors = Object.values(error.errors).map(err => err.message);
    return res.status(400).json({
      success: false,
      message: 'Validation Error',
      errors
    });
  }

  // Mongoose duplicate key error
  if (error.code === 11000) {
    const field = Object.keys(error.keyValue)[0];
    return res.status(409).json({
      success: false,
      message: `${field} already exists`
    });
  }

  // JWT errors
  if (error.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }

  if (error.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token expired'
    });
  }

  // Default error response
  res.status(error.status || 500).json({
    success: false,
    message: error.message || 'Internal Server Error',
    timestamp: new Date().toISOString(),
    ...(process.env.NODE_ENV === 'development' && {
      stack: error.stack,
      details: error
    })
  });
});

// =============================================================================
// SERVER STARTUP
// =============================================================================

const startServer = async () => {
  try {
    console.log('🚀 Starting Prometheus Server...');
    console.log(`🌍 Environment: ${process.env.NODE_ENV}`);

    // Connect to MongoDB first
    await connectDB();

    // Start Express server
    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`
🔥 Prometheus Marketing Bot API 🔥
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚡ Server: http://localhost:${PORT}
🌍 Environment: ${process.env.NODE_ENV}
📊 Database: MongoDB
🏥 Health: http://localhost:${PORT}/health
🔗 API Base: http://localhost:${PORT}/api

Ready to ignite your campaigns! 🚀
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      `);
    });

    // Graceful shutdown
    const gracefulShutdown = (signal) => {
      console.log(`\n🛑 ${signal} received, shutting down gracefully...`);
      server.close(async () => {
        console.log('✅ Server closed');
        // MongoDB connection is closed in database.js
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server
startServer();