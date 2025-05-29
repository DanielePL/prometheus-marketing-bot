import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/database.js';

// Import routes
import authRoutes from './routes/auth.js';
import productRoutes from './routes/products.js';
import campaignRoutes from './routes/campaigns.js';
import marketIntelligenceRoutes from './routes/market-intelligence.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'Prometheus Marketing Bot API',
    version: '1.0.0',
    environment: process.env.NODE_ENV,
    database: 'MongoDB',
    timestamp: new Date().toISOString()
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/campaigns', campaignRoutes);
app.use('/api/market-intelligence', marketIntelligenceRoutes);

// Root API endpoint
app.get('/api', (req, res) => {
  res.json({
    message: 'Welcome to Prometheus Marketing Bot API 🔥',
    version: '1.0.0',
    documentation: '/api/docs',
    endpoints: {
      auth: '/api/auth',
      products: '/api/products',
      campaigns: '/api/campaigns',
      marketIntelligence: '/api/market-intelligence'
    }
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('❌ Server Error:', err);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && {
      stack: err.stack,
      error: err
    })
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`
🔥 Prometheus Marketing Bot API 🔥
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚡ Server: http://localhost:${PORT}
🌍 Environment: ${process.env.NODE_ENV}
📊 Database: MongoDB (DigitalOcean)
🏥 Health: http://localhost:${PORT}/health

Ready to ignite your campaigns! 🚀
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  `);
});