import type { DevOpsData } from '../types/devops.types';

export interface DevOpsFilters { environment?: string; status?: string; }

const t = (offsetSec: number) => new Date(Date.now() + offsetSec * 1000).toISOString();

const mockData: DevOpsData = {
  metrics: {
    deploymentsToday: 10,
    successRate: 92,
    systemUptime: 99.94,
    mttrMinutes: 18,
    activePipelines: 2,
    firingAlerts: 1,
  },
  pipelines: [
    {
      id: 'PLN-001', name: 'EHR API Build & Deploy', application: 'Epic EHR Backend', branch: 'main',
      triggeredBy: 'Kiran Dev', status: 'Success', durationSeconds: 342, startedAt: t(-3600),
      commitSha: 'a3f9c8b',
      stages: [
        { name: 'Build', status: 'Success', durationSeconds: 78 },
        { name: 'Test', status: 'Success', durationSeconds: 145 },
        { name: 'Security Scan', status: 'Success', durationSeconds: 62 },
        { name: 'Deploy', status: 'Success', durationSeconds: 57 },
      ],
    },
    {
      id: 'PLN-002', name: 'Patient Portal Frontend', application: 'Patient Portal', branch: 'feature/auth-v2',
      triggeredBy: 'Sneha Frontend', status: 'Running', durationSeconds: 120, startedAt: t(-120),
      commitSha: 'c72de1f',
      stages: [
        { name: 'Build', status: 'Success', durationSeconds: 55 },
        { name: 'Test', status: 'Running', durationSeconds: 65 },
        { name: 'Security Scan', status: 'Pending', durationSeconds: 0 },
        { name: 'Deploy', status: 'Pending', durationSeconds: 0 },
      ],
    },
    {
      id: 'PLN-003', name: 'Billing Service Deploy', application: 'Billing Microservice', branch: 'release/2.4.1',
      triggeredBy: 'CI Bot', status: 'Failed', durationSeconds: 198, startedAt: t(-7200),
      commitSha: 'e991ba2',
      stages: [
        { name: 'Build', status: 'Success', durationSeconds: 66 },
        { name: 'Test', status: 'Success', durationSeconds: 78 },
        { name: 'Security Scan', status: 'Failed', durationSeconds: 54 },
        { name: 'Deploy', status: 'Skipped', durationSeconds: 0 },
      ],
    },
    {
      id: 'PLN-004', name: 'PACS Imaging Service', application: 'Radiology PACS', branch: 'main',
      triggeredBy: 'Arun Infra', status: 'Queued', durationSeconds: 0, startedAt: t(-30),
      commitSha: 'b44a0cd',
      stages: [
        { name: 'Build', status: 'Pending', durationSeconds: 0 },
        { name: 'Test', status: 'Pending', durationSeconds: 0 },
        { name: 'Security Scan', status: 'Pending', durationSeconds: 0 },
        { name: 'Deploy', status: 'Pending', durationSeconds: 0 },
      ],
    },
  ],
  deployments: [
    { id: 'DEP-101', application: 'Epic EHR Backend', version: 'v4.2.1', environment: 'Production', status: 'Success', deployedBy: 'CI Bot', deployedAt: t(-3600), rollbackAvailable: true, previousVersion: 'v4.2.0', healthCheckUrl: 'https://ehr.hospital.internal/health' },
    { id: 'DEP-102', application: 'Billing Microservice', version: 'v2.4.0', environment: 'Staging', status: 'Failed', deployedBy: 'CI Bot', deployedAt: t(-7200), rollbackAvailable: false, healthCheckUrl: 'https://billing.staging.internal/health' },
    { id: 'DEP-103', application: 'Patient Portal', version: 'v1.9.3', environment: 'Development', status: 'Success', deployedBy: 'Sneha Frontend', deployedAt: t(-1800), rollbackAvailable: true, previousVersion: 'v1.9.2', healthCheckUrl: 'https://portal.dev.internal/health' },
    { id: 'DEP-104', application: 'Radiology PACS', version: 'v3.1.0', environment: 'Production', status: 'Rolled Back', deployedBy: 'Arun Infra', deployedAt: t(-86400), rollbackAvailable: false, previousVersion: 'v3.0.8', healthCheckUrl: 'https://pacs.hospital.internal/health' },
  ],
  environments: [
    { id: 'ENV-PROD', name: 'Production', provider: 'AWS', region: 'ap-south-1', status: 'Running', cpuUsage: 62, memoryUsage: 71, diskUsage: 48, services: 24, servicesHealthy: 24 },
    { id: 'ENV-STG', name: 'Staging', provider: 'AWS', region: 'ap-south-1', status: 'Degraded', cpuUsage: 38, memoryUsage: 45, diskUsage: 33, services: 18, servicesHealthy: 16 },
    { id: 'ENV-DEV', name: 'Development', provider: 'On-Prem', region: 'DC-Mumbai', status: 'Running', cpuUsage: 22, memoryUsage: 30, diskUsage: 60, services: 12, servicesHealthy: 12 },
  ],
  alerts: [
    { id: 'ALT-001', title: 'Billing Microservice health check failing on Staging', severity: 'Critical', environment: 'Staging', service: 'billing-svc', status: 'Firing', firedAt: t(-7200) },
    { id: 'ALT-002', title: 'High memory usage on Prod app servers (>70%)', severity: 'Warning', environment: 'Production', service: 'ehr-backend', status: 'Acknowledged', firedAt: t(-3600) },
    { id: 'ALT-003', title: 'Slow query detected in EHR database (>2s avg)', severity: 'Warning', environment: 'Production', service: 'ehr-db', status: 'Firing', firedAt: t(-1800) },
  ],
  logs: [
    { timestamp: t(-60), level: 'ERROR', service: 'billing-svc', message: 'Health check endpoint /health returned 503 Service Unavailable' },
    { timestamp: t(-90), level: 'WARN', service: 'ehr-backend', message: 'Memory usage exceeded 70% threshold on pod ehr-backend-7d4f8b-xkp2q' },
    { timestamp: t(-180), level: 'INFO', service: 'ci-pipeline', message: 'Pipeline PLN-001 completed successfully in 342s' },
    { timestamp: t(-300), level: 'ERROR', service: 'billing-svc', message: 'SecurityScan step failed — CVE-2024-1234 found in dependency org.apache.commons:2.1' },
    { timestamp: t(-600), level: 'INFO', service: 'deploy-agent', message: 'Deployment DEP-101 to Production: health checks passed (3/3)' },
    { timestamp: t(-900), level: 'WARN', service: 'ehr-db', message: 'Slow query detected: SELECT * FROM patient_records WHERE... avg=2340ms' },
  ],
};

export const devopsApi = {
  getDashboardData: async (f: DevOpsFilters) => ({ data: mockData, message: 'Success', status: 200 }),
  triggerPipeline: async (id: string) => ({ data: { success: true }, message: 'Pipeline triggered', status: 200 }),
  rollbackDeployment: async (id: string) => ({ data: { success: true }, message: 'Rollback initiated', status: 200 }),
  acknowledgeAlert: async (id: string) => ({ data: { success: true }, message: 'Alert acknowledged', status: 200 }),
};
