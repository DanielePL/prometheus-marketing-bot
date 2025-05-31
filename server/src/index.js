// /prometheus-marketing-engine/server/src/index.js
// Prometheus Marketing Engine - Main Server (Updated mit API Settings)

import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import dotenv from 'dotenv';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';

// Import Routes
import campaignsRouter from './routes/campaigns.js';
import apiSettingsRouter from './routes/apiSettings.js';
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

// Main campaigns API
app.use('/api/campaigns', campaignsRouter);

// API Settings (NEW!)
app.use('/api/settings', apiSettingsRouter);

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    const performanceService = getLivePerformanceService();
    const health = performanceService.healthCheck();

    res.json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      server: 'Prometheus Marketing Engine',
      version: '1.0.0',
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
  res.json({
    success: true,
    message: 'Prometheus Marketing Engine API is running',
    timestamp: new Date().toISOString(),
    endpoints: {
      campaigns: '/api/campaigns',
      performance: '/api/campaigns/performance/live',
      dashboard: '/api/campaigns/dashboard',
      settings: '/api/settings',
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
    documentation: '/api/status',
    timestamp: new Date().toISOString()
  });
});

// ==========================================
// WEBSOCKET EVENTS
// ==========================================

io.on('connection', (socket) => {
  console.log(`🔌 Client connected: ${socket.id}`);

  // Send welcome message
  socket.emit('prometheus-status', {
    message: 'Connected to Prometheus Marketing Engine Live Feed',
    clientId: socket.id,
    timestamp: new Date().toISOString()
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

  // Handle API settings updates
  socket.on('api-settings-changed', (data) => {
    // Broadcast settings change to all clients
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
  console.log(`💚 Health: http://${HOST}:${PORT}/health`);
  console.log(`🔌 WebSocket: ws://${HOST}:${PORT}`);
  console.log('🚀 ====================================');

  // Initialize Live Performance Monitoring
  // Note: Now controlled by API Settings, not environment variable
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
});

// ==========================================
// GRACEFUL SHUTDOWN
// ==========================================

process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down gracefully...');

  // Stop monitoring
  try {
    const performanceService = getLivePerformanceService();
    performanceService.stopMonitoring();
    console.log('✅ Monitoring stopped');
  } catch (error) {
    console.error('❌ Error stopping monitoring:', error);
  }

  // Close server
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received, shutting down gracefully...');

  // Stop monitoring
  try {
    const performanceService = getLivePerformanceService();
    performanceService.stopMonitoring();
    console.log('✅ Monitoring stopped');
  } catch (error) {
    console.error('❌ Error stopping monitoring:', error);
  }

  // Close server
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

export default app;