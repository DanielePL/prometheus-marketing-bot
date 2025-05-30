// server/src/routes/performance.js - NEUE DATEI ERSTELLEN
import express from 'express';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import PerformanceMetric from '../models/PerformanceMetric.js';
import Campaign from '../models/Campaign.js';
import livePerformanceService from '../services/livePerformanceService.js';

const router = express.Router();

// Enhanced middleware to authenticate JWT token
const authenticateToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    // DEV-MODE SUPPORT
    if (process.env.NODE_ENV === 'development' && token.startsWith('dev-token-')) {
      const devUserId = new mongoose.Types.ObjectId('507f1f77bcf86cd799439011');
      req.user = {
        _id: devUserId,
        email: 'dev@prometheus.com',
        name: 'Dev User',
        plan: 'ENTERPRISE',
        status: 'ACTIVE'
      };
      return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await Campaign.findById(decoded.userId);

    if (!user || user.status !== 'ACTIVE') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token or user inactive'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('❌ Auth middleware error:', error);
    return res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
};

// === LIVE PERFORMANCE ENDPOINTS ===

// GET /api/performance/live/:campaignId - Real-time metrics
router.get('/live/:campaignId', authenticateToken, async (req, res) => {
  try {
    const { campaignId } = req.params;
    const { platform = 'COMBINED' } = req.query;

    console.log(`📊 Getting live metrics for campaign: ${campaignId}, platform: ${platform}`);

    // Verify campaign belongs to user
    const campaign = await Campaign.findOne({
      _id: campaignId,
      userId: req.user._id
    });

    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: 'Campaign not found'
      });
    }

    // Get real-time metrics
    const liveMetrics = await livePerformanceService.getRealtimeMetrics(campaignId, platform);

    if (!liveMetrics) {
      return res.status(404).json({
        success: false,
        message: 'No live metrics available',
        hint: 'Metrics will be available after the campaign runs for a few minutes'
      });
    }

    // Get performance summary
    const summary = await livePerformanceService.getCampaignPerformance(campaignId);

    res.json({
      success: true,
      timestamp: new Date().toISOString(),
      metrics: liveMetrics,
      summary: summary,
      updateInterval: '15 minutes',
      nextUpdate: new Date(Date.now() + 15 * 60 * 1000).toISOString()
    });

  } catch (error) {
    console.error('❌ Error getting live metrics:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting live metrics',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// GET /api/performance/dashboard/:campaignId - Complete dashboard data
router.get('/dashboard/:campaignId', authenticateToken, async (req, res) => {
  try {
    const { campaignId } = req.params;

    console.log(`📈 Getting dashboard data for campaign: ${campaignId}`);

    // Verify campaign
    const campaign = await Campaign.findOne({
      _id: campaignId,
      userId: req.user._id
    }).populate('productId');

    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: 'Campaign not found'
      });
    }

    // Get all performance data
    const [
      liveMetrics,
      performanceHistory,
      platformBreakdown,
      activeAlerts
    ] = await Promise.all([
      livePerformanceService.getRealtimeMetrics(campaignId, 'COMBINED'),
      livePerformanceService.getPerformanceHistory(campaignId, 24),
      PerformanceMetric.find({
        campaignId,
        platform: { $ne: 'COMBINED' },
        timestamp: { $gte: new Date(Date.now() - 60 * 60 * 1000) } // Last hour
      }).sort({ timestamp: -1 }),
      PerformanceMetric.getActiveAlerts(campaignId)
    ]);

    // Calculate profit details
    const profitDetails = liveMetrics ? {
      revenue: liveMetrics.revenue,
      adSpend: liveMetrics.spend,
      productCosts: liveMetrics.conversions * (campaign.productId?.price * 0.3 || 30), // 30% COGS
      grossProfit: liveMetrics.profit,
      profitMargin: liveMetrics.profitMargin,
      roas: liveMetrics.roas
    } : null;

    // Performance trends (compare to previous period)
    const trends = {};
    if (performanceHistory.length >= 2) {
      const current = performanceHistory[0];
      const previous = performanceHistory[1];

      trends.spend = current.spend > 0 ? ((current.spend - previous.spend) / previous.spend * 100) : 0;
      trends.roas = current.roas > 0 ? ((current.roas - previous.roas) / previous.roas * 100) : 0;
      trends.conversions = current.conversions > 0 ? ((current.conversions - previous.conversions) / previous.conversions * 100) : 0;
      trends.profit = current.profit !== 0 ? ((current.profit - previous.profit) / Math.abs(previous.profit) * 100) : 0;
    }

    res.json({
      success: true,
      timestamp: new Date().toISOString(),
      campaign: {
        id: campaign._id,
        name: campaign.name,
        status: campaign.status,
        budget: campaign.budget
      },
      liveMetrics,
      profitDetails,
      trends,
      performanceHistory: performanceHistory.slice(0, 48), // Last 48 data points
      platformBreakdown,
      alerts: activeAlerts,
      updateInterval: '15 minutes'
    });

  } catch (error) {
    console.error('❌ Error getting dashboard data:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting dashboard data',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// GET /api/performance/history/:campaignId - Performance history
router.get('/history/:campaignId', authenticateToken, async (req, res) => {
  try {
    const { campaignId } = req.params;
    const { hours = 24, platform = 'COMBINED' } = req.query;

    console.log(`📊 Getting performance history: ${campaignId}, ${hours}h, ${platform}`);

    // Verify campaign
    const campaign = await Campaign.findOne({
      _id: campaignId,
      userId: req.user._id
    });

    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: 'Campaign not found'
      });
    }

    const history = await PerformanceMetric.find({
      campaignId,
      platform,
      timestamp: { $gte: new Date(Date.now() - (hours * 60 * 60 * 1000)) },
      isLive: true
    }).sort({ timestamp: -1 });

    res.json({
      success: true,
      history,
      totalDataPoints: history.length,
      timeRange: `${hours} hours`,
      platform
    });

  } catch (error) {
    console.error('❌ Error getting performance history:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting performance history'
    });
  }
});

// GET /api/performance/alerts/:campaignId - Active alerts
router.get('/alerts/:campaignId', authenticateToken, async (req, res) => {
  try {
    const { campaignId } = req.params;

    console.log(`🚨 Getting alerts for campaign: ${campaignId}`);

    // Verify campaign
    const campaign = await Campaign.findOne({
      _id: campaignId,
      userId: req.user._id
    });

    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: 'Campaign not found'
      });
    }

    const alerts = await PerformanceMetric.getActiveAlerts(campaignId);

    // Flatten alerts from all metrics
    const allAlerts = [];
    alerts.forEach(metric => {
      metric.alerts.forEach(alert => {
        if (alert.triggered && !alert.acknowledgedAt) {
          allAlerts.push({
            ...alert.toObject(),
            metricId: metric._id,
            platform: metric.platform,
            timestamp: metric.timestamp
          });
        }
      });
    });

    // Sort by severity and timestamp
    allAlerts.sort((a, b) => {
      const severityOrder = { 'CRITICAL': 4, 'HIGH': 3, 'MEDIUM': 2, 'LOW': 1 };
      const severityDiff = severityOrder[b.severity] - severityOrder[a.severity];
      if (severityDiff !== 0) return severityDiff;

      return new Date(b.timestamp) - new Date(a.timestamp);
    });

    res.json({
      success: true,
      alerts: allAlerts,
      summary: {
        total: allAlerts.length,
        critical: allAlerts.filter(a => a.severity === 'CRITICAL').length,
        high: allAlerts.filter(a => a.severity === 'HIGH').length,
        medium: allAlerts.filter(a => a.severity === 'MEDIUM').length,
        low: allAlerts.filter(a => a.severity === 'LOW').length
      }
    });

  } catch (error) {
    console.error('❌ Error getting alerts:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting alerts'
    });
  }
});

// POST /api/performance/alerts/:campaignId/acknowledge - Acknowledge alert
router.post('/alerts/:campaignId/acknowledge', authenticateToken, async (req, res) => {
  try {
    const { campaignId } = req.params;
    const { alertType, metricId } = req.body;

    console.log(`✅ Acknowledging alert: ${alertType} for campaign: ${campaignId}`);

    // Verify campaign
    const campaign = await Campaign.findOne({
      _id: campaignId,
      userId: req.user._id
    });

    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: 'Campaign not found'
      });
    }

    if (metricId) {
      // Acknowledge specific alert
      await PerformanceMetric.updateOne(
        {
          _id: metricId,
          'alerts.type': alertType,
          'alerts.triggered': true
        },
        {
          $set: { 'alerts.$.acknowledgedAt': new Date() }
        }
      );
    } else {
      // Acknowledge all alerts of this type
      await livePerformanceService.acknowledgeAlert(campaignId, alertType);
    }

    res.json({
      success: true,
      message: 'Alert acknowledged',
      acknowledgedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Error acknowledging alert:', error);
    res.status(500).json({
      success: false,
      message: 'Server error acknowledging alert'
    });
  }
});

// POST /api/performance/force-update/:campaignId - Force metrics update (dev only)
router.post('/force-update/:campaignId', authenticateToken, async (req, res) => {
  try {
    if (process.env.NODE_ENV !== 'development') {
      return res.status(403).json({
        success: false,
        message: 'Force update only available in development mode'
      });
    }

    const { campaignId } = req.params;

    console.log(`🔄 Force updating metrics for campaign: ${campaignId}`);

    const campaign = await Campaign.findOne({
      _id: campaignId,
      userId: req.user._id
    }).populate('productId');

    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: 'Campaign not found'
      });
    }

    // Force update this campaign
    await livePerformanceService.updateCampaignPerformance(campaign);

    res.json({
      success: true,
      message: 'Metrics updated successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Error force updating metrics:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating metrics'
    });
  }
});

// GET /api/performance/system/status - System status
router.get('/system/status', authenticateToken, async (req, res) => {
  try {
    const status = {
      livePerformanceEngine: livePerformanceService.isRunning,
      lastUpdate: new Date().toISOString(),
      updateInterval: '15 minutes',
      totalCampaigns: await Campaign.countDocuments({ status: { $in: ['ACTIVE', 'DRAFT'] } }),
      totalMetrics: await PerformanceMetric.countDocuments({ isLive: true }),
      activeAlerts: await PerformanceMetric.countDocuments({ 'alerts.triggered': true, 'alerts.acknowledgedAt': { $exists: false } })
    };

    res.json({
      success: true,
      status
    });

  } catch (error) {
    console.error('❌ Error getting system status:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting system status'
    });
  }
});

export default router;