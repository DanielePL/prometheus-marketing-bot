// /prometheus-marketing-engine/server/src/index.js
// Prometheus Marketing Engine - Main Server (UPDATED: AI Consultant Integration)

import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import dotenv from 'dotenv';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import mongoose from 'mongoose';
import connectDB from './config/database.js';

// Import Routes
import campaignsRouter from './routes/campaigns.js';
import apiSettingsRouter from './routes/apiSettings.js';
import authRouter from './routes/auth.js';
import aiConsultantRouter from './routes/aiConsultant.js'; // ← NEW!
import { getLivePerformanceService } from './services/livePerformanceService.js';

// Load environment variables
dotenv.config();

const app = express();
const server = createServer(app);

// Initialize Socket.IO
const io = new SocketIOServer(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Global WebSocket für Broadcasting
global.io = io;

// ==========================================
// DATABASE CONNECTION
// ==========================================

console.log('🔌 Connecting to MongoDB...');
await connectDB();
console.log('✅ MongoDB connection established');

// ==========================================
// MIDDLEWARE SETUP
// ==========================================

// Security middleware
app.use(helmet({
  crossOriginEmbedderPolicy: false
}));

// Compression middleware
app.use(compression());

// Logging middleware
app.use(morgan('combined'));

// CORS middleware
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:3000",
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// ==========================================
// API ROUTES
// ==========================================

// Authentication routes
app.use('/api/auth', authRouter);

// Main campaigns API
app.use('/api/campaigns', campaignsRouter);

// API Settings
app.use('/api/settings', apiSettingsRouter);

// AI Consultant routes (NEW!)
app.use('/api/ai-consultant', aiConsultantRouter);

// Health check endpoint with MongoDB and AI status
app.get('/health', async (req, res) => {
  try {
    const performanceService = getLivePerformanceService();
    const health = performanceService.healthCheck();

    // Check MongoDB connection
    const mongoStatus = mongoose.connection.readyState;
    const mongoStates = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting'
    };

    // Check AI Consultant availability
    const hasOpenAI = !!process.env.OPENAI_API_KEY;

    res.json({
      status: mongoStatus === 1 ? 'OK' : 'ERROR',
      timestamp: new Date().toISOString(),
      server: 'Prometheus Marketing Engine',
      version: '1.0.0',
      database: {
        status: mongoStates[mongoStatus],
        host: mongoose.connection.host,
        name: mongoose.connection.name
      },
      aiConsultant: {
        available: hasOpenAI,
        status: hasOpenAI ? 'ACTIVE' : 'DISABLED',
        features: hasOpenAI ? ['Chat', 'Analysis', 'Optimization'] : ['Limited Mode']
      },
      prometheus: health,
      environment: process.env.NODE_ENV || 'development'
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// API status endpoint
app.get('/api/status', (req, res) => {
  const mongoStatus = mongoose.connection.readyState;
  const hasOpenAI = !!process.env.OPENAI_API_KEY;

  res.json({
    success: true,
    message: 'Prometheus Marketing Engine API is running',
    timestamp: new Date().toISOString(),
    database: {
      connected: mongoStatus === 1,
      status: mongoStatus === 1 ? 'connected' : 'disconnected'
    },
    aiConsultant: {
      enabled: hasOpenAI,
      features: ['Performance Analysis', 'Budget Optimization', 'Creative Suggestions', 'Real-time Chat']
    },
    endpoints: {
      auth: '/api/auth',
      campaigns: '/api/campaigns',
      performance: '/api/campaigns/performance/live',
      dashboard: '/api/campaigns/dashboard',
      settings: '/api/settings',
      aiConsultant: '/api/ai-consultant', // NEW!
      health: '/health'
    }
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: '🚀 Prometheus Marketing Engine API',
    version: '1.0.0',
    status: 'Active',
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
    aiConsultant: !!process.env.OPENAI_API_KEY ? '🧠 Active' : '⚠️ Disabled',
    documentation: '/api/status',
    timestamp: new Date().toISOString()
  });
});

// ==========================================
// WEBSOCKET EVENTS (Enhanced for AI)
// ==========================================

io.on('connection', (socket) => {
  console.log(`🔌 Client connected: ${socket.id}`);

  // Send welcome message with AI status
  socket.emit('prometheus-status', {
    message: 'Connected to Prometheus Marketing Engine Live Feed',
    clientId: socket.id,
    timestamp: new Date().toISOString(),
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
    aiConsultant: !!process.env.OPENAI_API_KEY ? 'Available' : 'Disabled'
  });

  // Handle client requests for immediate data
  socket.on('request-live-data', async () => {
    try {
      const performanceService = getLivePerformanceService();
      await performanceService.triggerManualCycle();
    } catch (error) {
      socket.emit('error', {
        message: 'Failed to fetch live data',
        error: error.message
      });
    }
  });

  // AI Consultant WebSocket events
  socket.on('ai-consultant-session-start', (data) => {
    console.log(`🧠 AI Consultant session started for ${socket.id}`);
    socket.join(`ai-consultant-${data.userId}`);
  });

  socket.on('ai-consultant-session-end', (data) => {
    console.log(`🧠 AI Consultant session ended for ${socket.id}`);
    socket.leave(`ai-consultant-${data.userId}`);
  });

  // Handle API settings updates
  socket.on('api-settings-changed', (data) => {
    socket.broadcast.emit('api-settings-update', data);
  });

  // Handle disconnection
  socket.on('disconnect', (reason) => {
    console.log(`🔌 Client disconnected: ${socket.id} (${reason})`);
  });

  // Handle errors
  socket.on('error', (error) => {
    console.error(`❌ Socket error for ${socket.id}:`, error);
  });
});

// ==========================================
// ERROR HANDLING MIDDLEWARE
// ==========================================

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found',
    path: req.originalUrl,
    availableEndpoints: [
      '/api/auth',
      '/api/campaigns',
      '/api/ai-consultant', // NEW!
      '/api/settings',
      '/health'
    ],
    timestamp: new Date().toISOString()
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('❌ Global error handler:', error);

  res.status(error.status || 500).json({
    success: false,
    message: error.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
    timestamp: new Date().toISOString()
  });
});

// ==========================================
// SERVER STARTUP
// ==========================================

const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || 'localhost';

// Start server
server.listen(PORT, HOST, async () => {
  console.log('🚀 ====================================');
  console.log('   PROMETHEUS MARKETING ENGINE');
  console.log('🚀 ====================================');
  console.log(`🌐 Server: http://${HOST}:${PORT}`);
  console.log(`📊 API: http://${HOST}:${PORT}/api/status`);
  console.log(`⚙️ Settings: http://${HOST}:${PORT}/api/settings`);
  console.log(`🧠 AI Consultant: http://${HOST}:${PORT}/api/ai-consultant`);
  console.log(`💚 Health: http://${HOST}:${PORT}/health`);
  console.log(`🔌 WebSocket: ws://${HOST}:${PORT}`);
  console.log(`🗄️ MongoDB: ${mongoose.connection.readyState === 1 ? '✅ Connected' : '❌ Disconnected'}`);
  console.log(`🤖 AI Consultant: ${!!process.env.OPENAI_API_KEY ? '✅ Active' : '⚠️ Disabled (Add OPENAI_API_KEY)'}`);
  console.log('🚀 ====================================');

  // Initialize Live Performance Monitoring
  try {
    console.log('🤖 Starting Live Performance Monitoring...');
    const performanceService = getLivePerformanceService();
    performanceService.startMonitoring();
    console.log('✅ Live Monitoring ACTIVE - Running every 15 minutes');
    console.log('⚙️ Use API Settings to control Google Ads integration');
  } catch (error) {
    console.error('❌ Failed to start monitoring:', error);
    console.log('⚠️ Server running without live monitoring');
  }

  console.log('🚀 Prometheus Marketing Engine ready for action!');

  // AI Consultant startup message
  if (process.env.OPENAI_API_KEY) {
    console.log('🧠 AI Performance Marketing Consultant: READY');
    console.log('💬 Features: Chat, Analysis, Optimization, Strategic Advice');
  } else {
    console.log('⚠️ AI Consultant disabled - Add OPENAI_API_KEY to enable');
  }
});

// ==========================================
// GRACEFUL SHUTDOWN
// ==========================================

process.on('SIGTERM', async () => {
  console.log('🛑 SIGTERM received, shutting down gracefully...');

  try {
    const performanceService = getLivePerformanceService();
    performanceService.stopMonitoring();
    console.log('✅ Monitoring stopped');
  } catch (error) {
    console.error('❌ Error stopping monitoring:', error);
  }

  try {
    await mongoose.connection.close();
    console.log('✅ MongoDB connection closed');
  } catch (error) {
    console.error('❌ Error closing MongoDB:', error);
  }

  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', async () => {
  console.log('🛑 SIGINT received, shutting down gracefully...');

  try {
    const performanceService = getLivePerformanceService();
    performanceService.stopMonitoring();
    console.log('✅ Monitoring stopped');
  } catch (error) {
    console.error('❌ Error stopping monitoring:', error);
  }

  try {
    await mongoose.connection.close();
    console.log('✅ MongoDB connection closed');
  } catch (error) {
    console.error('❌ Error closing MongoDB:', error);
  }

  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', async (error) => {
  console.error('❌ Uncaught Exception:', error);

  try {
    await mongoose.connection.close();
  } catch (closeError) {
    console.error('❌ Error closing MongoDB during exception:', closeError);
  }

  process.exit(1);
});

process.on('unhandledRejection', async (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);

  try {
    await mongoose.connection.close();
  } catch (closeError) {
    console.error('❌ Error closing MongoDB during rejection:', closeError);
  }

  process.exit(1);
});

export default app;