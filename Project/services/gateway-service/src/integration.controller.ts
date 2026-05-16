import { Controller, Get, Post, Param, Query, Logger, HttpException, HttpStatus } from '@nestjs/common';
import axios from 'axios';

/**
 * MedTrustX — Gateway Integration Controller
 * ──────────────────────────────────────────────────
 * Provides unified endpoints for the frontend to:
 *   • Check health of all backend microservices
 *   • Aggregate dashboard statistics
 *   • Retrieve recent cross-service activity
 *   • Manage system-wide alerts
 */

/* ── Service Registry ────────────────────────────────── */

interface ServiceEntry {
  name: string;
  url: string;
  healthPath: string;
  category: 'clinical' | 'operational' | 'platform' | 'security';
}

const SERVICES: ServiceEntry[] = [
  // Clinical Services (Python/FastAPI)
  { name: 'patient-service', url: 'http://patient-service:8000', healthPath: '/health', category: 'clinical' },
  { name: 'clinical-service', url: 'http://clinical-service:8000', healthPath: '/health', category: 'clinical' },
  { name: 'diagnostics-service', url: 'http://diagnostics-service:8000', healthPath: '/health', category: 'clinical' },
  { name: 'pharmacy-service', url: 'http://pharmacy-service:8000', healthPath: '/health', category: 'clinical' },
  { name: 'nursing-service', url: 'http://nursing-service:8000', healthPath: '/health', category: 'clinical' },
  { name: 'ot-service', url: 'http://ot-service:8000', healthPath: '/health', category: 'clinical' },
  { name: 'icu-service', url: 'http://icu-service:8000', healthPath: '/health', category: 'clinical' },
  { name: 'blood-bank-service', url: 'http://blood-bank-service:8000', healthPath: '/health', category: 'clinical' },
  { name: 'infection-control-service', url: 'http://infection-control-service:8000', healthPath: '/health', category: 'clinical' },
  { name: 'medical-records-service', url: 'http://medical-records-service:8000', healthPath: '/health', category: 'clinical' },
  { name: 'ai-service', url: 'http://ai-service:8000', healthPath: '/health', category: 'platform' },
  { name: 'devices-service', url: 'http://devices-service:8000', healthPath: '/health', category: 'platform' },

  // Operational Services (Node.js/NestJS)
  { name: 'appointment-service', url: 'http://appointment-service:3000', healthPath: '/api/v1/health', category: 'operational' },
  { name: 'billing-service', url: 'http://billing-service:3000', healthPath: '/api/v1/health', category: 'operational' },
  { name: 'inventory-service', url: 'http://inventory-service:3000', healthPath: '/api/v1/health', category: 'operational' },
  { name: 'hr-service', url: 'http://hr-service:3000', healthPath: '/api/v1/health', category: 'operational' },
  { name: 'facilities-service', url: 'http://facilities-service:3000', healthPath: '/api/v1/health', category: 'operational' },
  { name: 'er-service', url: 'http://er-service:3000', healthPath: '/api/v1/health', category: 'clinical' },
  { name: 'bed-management-service', url: 'http://bed-management-service:3000', healthPath: '/api/v1/health', category: 'operational' },
  { name: 'order-service', url: 'http://order-service:3000', healthPath: '/api/v1/health', category: 'operational' },
  { name: 'telemedicine-service', url: 'http://telemedicine-service:3000', healthPath: '/api/v1/health', category: 'clinical' },
  { name: 'notification-service', url: 'http://notification-service:3000', healthPath: '/api/v1/health', category: 'platform' },
  { name: 'management-service', url: 'http://management-service:3000', healthPath: '/api/v1/health', category: 'operational' },
  { name: 'compliance-service', url: 'http://compliance-service:3000', healthPath: '/api/v1/health', category: 'security' },
  { name: 'audit-service', url: 'http://audit-service:3000', healthPath: '/api/v1/health', category: 'security' },

  // Platform/ZTA Services (Python)
  { name: 'iam-service', url: 'http://iam-service:8000', healthPath: '/health', category: 'security' },
  { name: 'zta-service', url: 'http://zta-service:8000', healthPath: '/health', category: 'security' },
  { name: 'analytics-service', url: 'http://analytics-service:8000', healthPath: '/health', category: 'platform' },
  { name: 'threat-detection-service', url: 'http://threat-detection-service:8000', healthPath: '/health', category: 'security' },
];

/* ── Interfaces ──────────────────────────────────────── */

interface ServiceHealthStatus {
  name: string;
  status: 'healthy' | 'degraded' | 'unhealthy' | 'unknown';
  uptime: string;
  responseTime: number;
  lastChecked: string;
  version?: string;
  endpoint: string;
}

interface SystemHealthSummary {
  overallStatus: 'healthy' | 'degraded' | 'critical';
  totalServices: number;
  healthyCount: number;
  degradedCount: number;
  unhealthyCount: number;
  services: ServiceHealthStatus[];
  checkedAt: string;
}

interface ActivityEvent {
  id: string;
  time: string;
  event: string;
  type: 'critical' | 'warning' | 'success' | 'info';
  source: string;
  entityId?: string;
}

interface SystemAlert {
  id: string;
  severity: 'critical' | 'warning' | 'info';
  title: string;
  message: string;
  source: string;
  timestamp: string;
  acknowledged: boolean;
}

/* ── Controller ──────────────────────────────────────── */

@Controller('gateway')
export class IntegrationController {
  private readonly logger = new Logger(IntegrationController.name);
  private alertsStore: SystemAlert[] = [];

  /* ── Health Aggregation ─────────────────────────── */

  @Get('health/all')
  async getSystemHealth(): Promise<SystemHealthSummary> {
    this.logger.debug('Aggregating health from all services...');

    const healthChecks = await Promise.allSettled(
      SERVICES.map(svc => this.checkServiceHealth(svc))
    );

    const services: ServiceHealthStatus[] = healthChecks.map((result, i) => {
      if (result.status === 'fulfilled') {
        return result.value;
      }
      return {
        name: SERVICES[i].name,
        status: 'unknown' as const,
        uptime: 'N/A',
        responseTime: 0,
        lastChecked: new Date().toISOString(),
        endpoint: SERVICES[i].url,
      };
    });

    const healthyCount = services.filter(s => s.status === 'healthy').length;
    const degradedCount = services.filter(s => s.status === 'degraded').length;
    const unhealthyCount = services.filter(s => s.status === 'unhealthy').length;

    const overallStatus: 'healthy' | 'degraded' | 'critical' =
      unhealthyCount > 3 ? 'critical' :
      (degradedCount > 0 || unhealthyCount > 0) ? 'degraded' : 'healthy';

    return {
      overallStatus,
      totalServices: SERVICES.length,
      healthyCount,
      degradedCount,
      unhealthyCount,
      services,
      checkedAt: new Date().toISOString(),
    };
  }

  @Get('health/:serviceName')
  async getServiceHealth(@Param('serviceName') serviceName: string): Promise<ServiceHealthStatus> {
    const service = SERVICES.find(s => s.name === serviceName);
    if (!service) {
      throw new HttpException(`Service '${serviceName}' not found in registry`, HttpStatus.NOT_FOUND);
    }
    return this.checkServiceHealth(service);
  }

  /* ── Dashboard Summary (cross-service aggregation) ─ */

  @Get('dashboard/summary')
  async getDashboardSummary() {
    this.logger.debug('Building dashboard summary...');

    // Parallel fetch from key services
    const [
      patientStats,
      appointmentStats,
      bedStats,
      billingStats,
    ] = await Promise.allSettled([
      this.fetchServiceData('patient-service', '/api/v1/patients/stats/summary'),
      this.fetchServiceData('appointment-service', '/api/v1/appointments/stats/today'),
      this.fetchServiceData('bed-management-service', '/api/v1/beds/occupancy/summary'),
      this.fetchServiceData('billing-service', '/api/v1/billing/revenue/summary'),
    ]);

    return {
      stats: [
        this.buildStat('patients', 'Active Patients', patientStats, 'totalActive', 'clinical'),
        this.buildStat('appointments', "Today's Appointments", appointmentStats, 'todayTotal', 'operational'),
        this.buildStat('beds', 'Bed Occupancy', bedStats, 'occupancyRate', 'operational'),
        this.buildStat('revenue', 'Revenue Today', billingStats, 'todayRevenue', 'financial'),
      ],
      recentActivity: [],
      serviceHealth: [],
      alerts: this.alertsStore.filter(a => !a.acknowledged),
    };
  }

  /* ── Recent Activity ───────────────────────────────── */

  @Get('activity/recent')
  async getRecentActivity(@Query('limit') limit?: number): Promise<ActivityEvent[]> {
    const effectiveLimit = Math.min(limit ?? 20, 100);

    // Try to fetch from audit-service or event bus
    try {
      const response = await axios.get(`http://audit-service:3000/api/v1/events/recent`, {
        params: { limit: effectiveLimit },
        timeout: 3000,
      });
      return response.data?.data ?? [];
    } catch {
      // Fallback — return empty (frontend handles gracefully)
      return [];
    }
  }

  /* ── Alerts ────────────────────────────────────────── */

  @Get('alerts')
  getAlerts(@Query('acknowledged') acknowledged?: string): SystemAlert[] {
    if (acknowledged !== undefined) {
      const isAcked = acknowledged === 'true';
      return this.alertsStore.filter(a => a.acknowledged === isAcked);
    }
    return this.alertsStore;
  }

  @Post('alerts/:alertId/acknowledge')
  acknowledgeAlert(@Param('alertId') alertId: string): { success: boolean } {
    const alert = this.alertsStore.find(a => a.id === alertId);
    if (alert) {
      alert.acknowledged = true;
      return { success: true };
    }
    throw new HttpException(`Alert '${alertId}' not found`, HttpStatus.NOT_FOUND);
  }

  /* ── Service Registry ──────────────────────────────── */

  @Get('services/registry')
  getServiceRegistry() {
    return SERVICES.map(s => ({
      name: s.name,
      category: s.category,
      url: s.url,
    }));
  }

  /* ── Private Helpers ───────────────────────────────── */

  private async checkServiceHealth(service: ServiceEntry): Promise<ServiceHealthStatus> {
    const start = Date.now();
    try {
      const response = await axios.get(`${service.url}${service.healthPath}`, { timeout: 5000 });
      const responseTime = Date.now() - start;

      return {
        name: service.name,
        status: responseTime > 3000 ? 'degraded' : 'healthy',
        uptime: response.data?.uptime ?? '99.9%',
        responseTime,
        lastChecked: new Date().toISOString(),
        version: response.data?.version,
        endpoint: service.url,
      };
    } catch (error) {
      const responseTime = Date.now() - start;
      // Distinguish between timeout (degraded) and error (unhealthy)
      const isTimeout = responseTime >= 4900;

      return {
        name: service.name,
        status: isTimeout ? 'degraded' : 'unhealthy',
        uptime: 'N/A',
        responseTime,
        lastChecked: new Date().toISOString(),
        endpoint: service.url,
      };
    }
  }

  private async fetchServiceData(serviceName: string, path: string): Promise<any> {
    const service = SERVICES.find(s => s.name === serviceName);
    if (!service) return null;

    try {
      const response = await axios.get(`${service.url}${path}`, { timeout: 5000 });
      return response.data;
    } catch {
      return null;
    }
  }

  private buildStat(
    id: string,
    label: string,
    result: PromiseSettledResult<any>,
    valueKey: string,
    category: string,
  ) {
    if (result.status === 'fulfilled' && result.value?.[valueKey] !== undefined) {
      const val = result.value[valueKey];
      return {
        id,
        label,
        value: typeof val === 'number' ? val : String(val),
        change: result.value?.changePercent ? `${result.value.changePercent}%` : '—',
        trend: (result.value?.changePercent ?? 0) >= 0 ? 'up' : 'down',
        category,
      };
    }
    return { id, label, value: '—', change: '—', trend: 'stable', category };
  }
}
