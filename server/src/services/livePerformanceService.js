// /prometheus-marketing-engine/server/src/services/livePerformanceService.js
// Live Performance Monitoring Job - Läuft alle 15 Minuten

import cron from 'node-cron';
import GoogleAdsService from './integrations/googleAdsService.js';

class LivePerformanceService {
  constructor() {
    this.googleAdsService = new GoogleAdsService();
    this.isRunning = false;
    this.lastRun = null;
    this.stats = {
      totalRuns: 0,
      successfulRuns: 0,
      failedRuns: 0,
      lastError: null
    };

    console.log('🚀 Live Performance Service initialized');
  }

  /**
   * Startet das Live-Monitoring (alle 15 Minuten)
   */
  startMonitoring() {
    if (this.isRunning) {
      console.warn('⚠️ Monitoring already running');
      return;
    }

    // Cron Job: Alle 15 Minuten (*/15 * * * *)
    this.monitoringJob = cron.schedule('*/15 * * * *', async () => {
      await this.performMonitoringCycle();
    }, {
      scheduled: false // Startet nicht automatisch
    });

    this.monitoringJob.start();
    this.isRunning = true;

    console.log('✅ Live Monitoring gestartet - Läuft alle 15 Minuten');

    // Initial run
    setTimeout(() => this.performMonitoringCycle(), 5000); // 5 Sekunden delay
  }

  /**
   * Stoppt das Live-Monitoring
   */
  stopMonitoring() {
    if (!this.isRunning) {
      console.warn('⚠️ Monitoring is not running');
      return;
    }

    if (this.monitoringJob) {
      this.monitoringJob.stop();
    }

    this.isRunning = false;
    console.log('⏹️ Live Monitoring gestoppt');
  }

  /**
   * Führt einen kompletten Monitoring-Zyklus aus
   */
  async performMonitoringCycle() {
    const startTime = Date.now();
    this.stats.totalRuns++;

    try {
      console.log('🔄 Starting Prometheus monitoring cycle...');

      // 1. Performance Daten holen
      const performanceData = await this.googleAdsService.getRealTimePerformance();
      const campaignCount = Object.keys(performanceData).length;

      console.log(`📊 Performance data fetched for ${campaignCount} campaigns`);

      // 2. Auto-Optimierung durchführen
      const optimizationResults = await this.googleAdsService.autoOptimizeCampaigns();
      const optimizationCount = Object.keys(optimizationResults).length;

      console.log(`🤖 Auto-optimization completed for ${optimizationCount} campaigns`);

      // 3. Dashboard Daten generieren
      const dashboardData = await this.googleAdsService.getPrometheusDashboardData();

      // 4. Kritische Alerts prüfen
      await this.checkCriticalAlerts(performanceData);

      // 5. Statistiken updaten
      this.stats.successfulRuns++;
      this.lastRun = new Date();

      const duration = Date.now() - startTime;

      console.log(`✅ Prometheus cycle completed in ${duration}ms`);
      console.log(`📈 Total: €${dashboardData.totalSpend.toFixed(2)} spend | €${dashboardData.totalRevenue.toFixed(2)} revenue | ROAS: ${dashboardData.averageRoas.toFixed(2)}`);

      // 6. Broadcast results to connected clients (WebSocket)
      this.broadcastResults({
        type: 'MONITORING_UPDATE',
        data: {
          performance: performanceData,
          optimizations: optimizationResults,
          dashboard: dashboardData,
          stats: this.getStats()
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      this.stats.failedRuns++;
      this.stats.lastError = {
        message: error.message,
        timestamp: new Date().toISOString()
      };

      console.error('❌ Prometheus monitoring cycle failed:', error);

      // Bei kritischen Fehlern: Retry nach 5 Minuten
      if (this.shouldRetry(error)) {
        console.log('🔄 Scheduling retry in 5 minutes...');
        setTimeout(() => this.performMonitoringCycle(), 5 * 60 * 1000);
      }
    }
  }

  /**
   * Prüft auf kritische Performance-Alerts
   */
  async checkCriticalAlerts(performanceData) {
    const alerts = [];

    for (const [campaignId, data] of Object.entries(performanceData)) {
      // Alert 1: Sehr niedrige ROAS bei hohem Spend
      if (data.roas < 1.5 && data.cost > 200) {
        alerts.push({
          type: 'CRITICAL_ROAS',
          campaignId: campaignId,
          campaignName: data.name,
          roas: data.roas,
          cost: data.cost,
          severity: 'HIGH'
        });
      }

      // Alert 2: Sehr hohe Kosten ohne Conversions
      if (data.cost > 500 && data.conversions === 0) {
        alerts.push({
          type: 'NO_CONVERSIONS',
          campaignId: campaignId,
          campaignName: data.name,
          cost: data.cost,
          severity: 'CRITICAL'
        });
      }

      // Alert 3: Plötzlicher Performance Drop
      const historical = await this.getHistoricalROAS(campaignId);
      if (historical && data.roas < historical * 0.5) {
        alerts.push({
          type: 'PERFORMANCE_DROP',
          campaignId: campaignId,
          campaignName: data.name,
          currentRoas: data.roas,
          historicalRoas: historical,
          severity: 'MEDIUM'
        });
      }
    }

    // Sende Alerts
    if (alerts.length > 0) {
      console.warn(`🚨 ${alerts.length} critical alerts detected`);
      await this.sendAlerts(alerts);
    }
  }

  /**
   * Sendet Alerts an verschiedene Kanäle
   */
  async sendAlerts(alerts) {
    for (const alert of alerts) {
      console.warn(`🚨 ALERT [${alert.severity}]: ${alert.type} - Campaign ${alert.campaignId} (${alert.campaignName})`);

      // Hier kannst du verschiedene Alert-Kanäle integrieren:
      // - Email notifications
      // - Slack/Discord Webhooks
      // - Push notifications
      // - Database logging

      // Beispiel: Slack Webhook (optional)
      if (process.env.SLACK_WEBHOOK_URL && alert.severity === 'CRITICAL') {
        await this.sendSlackAlert(alert);
      }
    }
  }

  /**
   * Slack Alert senden (optional)
   */
  async sendSlackAlert(alert) {
    try {
      const { default: axios } = await import('axios');

      const message = {
        text: `🚨 Prometheus Alert: ${alert.type}`,
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `*Campaign:* ${alert.campaignName}\n*Issue:* ${alert.type}\n*Severity:* ${alert.severity}`
            }
          }
        ]
      };

      await axios.post(process.env.SLACK_WEBHOOK_URL, message);
      console.log('📱 Slack alert sent');

    } catch (error) {
      console.error('❌ Slack alert failed:', error);
    }
  }

  /**
   * WebSocket Broadcast zu Frontend
   */
  broadcastResults(data) {
    try {
      // Integration mit deinem WebSocket Server
      if (global.io) {
        global.io.emit('prometheus-update', data);
        console.log('📡 Results broadcasted to frontend');
      }
    } catch (error) {
      console.error('❌ Broadcast failed:', error);
    }
  }

  /**
   * Holt historische ROAS für Vergleich
   */
  async getHistoricalROAS(campaignId) {
    try {
      // Query your database for historical ROAS
      // Return average ROAS from last 7 days
      return null; // Implementierung abhängig von deiner DB
    } catch (error) {
      return null;
    }
  }

  /**
   * Bestimmt ob ein Retry nach Fehler sinnvoll ist
   */
  shouldRetry(error) {
    // Retry bei temporären Fehlern
    const retryableErrors = [
      'RATE_LIMIT_EXCEEDED',
      'TEMPORARY_UNAVAILABLE',
      'NETWORK_ERROR',
      'TIMEOUT'
    ];

    return retryableErrors.some(err =>
      error.message.includes(err) || error.code === err
    );
  }

  /**
   * Gibt aktuelle Service-Statistiken zurück
   */
  getStats() {
    return {
      isRunning: this.isRunning,
      lastRun: this.lastRun,
      totalRuns: this.stats.totalRuns,
      successfulRuns: this.stats.successfulRuns,
      failedRuns: this.stats.failedRuns,
      successRate: this.stats.totalRuns > 0 ?
        (this.stats.successfulRuns / this.stats.totalRuns * 100).toFixed(2) : 0,
      lastError: this.stats.lastError,
      uptime: this.isRunning ? Date.now() - (this.lastRun?.getTime() || Date.now()) : 0
    };
  }

  /**
   * Manueller Trigger für Testing
   */
  async triggerManualCycle() {
    console.log('🔧 Manual monitoring cycle triggered');
    await this.performMonitoringCycle();
  }

  /**
   * Health Check für Service
   */
  healthCheck() {
    const stats = this.getStats();
    const isHealthy = this.isRunning &&
                      stats.successRate > 80 &&
                      (!this.lastRun || Date.now() - this.lastRun.getTime() < 20 * 60 * 1000); // max 20 min ago

    return {
      status: isHealthy ? 'HEALTHY' : 'UNHEALTHY',
      ...stats
    };
  }
}

// Singleton Pattern
let livePerformanceService = null;

export function getLivePerformanceService() {
  if (!livePerformanceService) {
    livePerformanceService = new LivePerformanceService();
  }
  return livePerformanceService;
}

export { LivePerformanceService };