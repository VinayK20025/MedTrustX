import type { AutomationData } from '../types/automation-bots.types';

const t = (sec: number) => new Date(Date.now() + sec * 1000).toISOString();

const mockData: AutomationData = {
  metrics: {
    activeBots: 45,
    totalJobsExecuted: 12540,
    successRate: 98.2,
    anomaliesDetected: 7,
    humanOverrides: 2,
  },
  bots: [
    { id: 'BOT-CI-01', name: 'ehr-build-pipeline', type: 'CI/CD Pipeline', status: 'Active', lastExecution: t(-120), successRate: 99.1 },
    { id: 'BOT-MON-42', name: 'cpu-anomaly-detector', type: 'Monitoring Agent', status: 'Active', lastExecution: t(-5), successRate: 100 },
    { id: 'BOT-SCA-05', name: 'k8s-pod-autoscaler', type: 'Auto-Scaler', status: 'Paused', lastExecution: t(-3600), successRate: 95.4 },
    { id: 'BOT-SEC-99', name: 'container-vuln-scanner', type: 'Security Scanner', status: 'Error', lastExecution: t(-86400), successRate: 88.2 },
    { id: 'BOT-CI-02', name: 'billing-release-bot', type: 'CI/CD Pipeline', status: 'Deploying', lastExecution: t(-10), successRate: 97.8 },
  ],
  jobs: [
    { id: 'JOB-9001', botId: 'BOT-CI-01', jobName: 'Compile & Test EHR Core', status: 'Success', durationMs: 45000, timestamp: t(-120), triggeredBy: 'GitHub Hook' },
    { id: 'JOB-9002', botId: 'BOT-CI-02', jobName: 'Deploy Billing API (v2.1)', status: 'Running', durationMs: 125000, timestamp: t(-10), triggeredBy: 'Manual Release' },
    { id: 'JOB-9003', botId: 'BOT-SEC-99', jobName: 'Nightly Container Scan', status: 'Failed', durationMs: 5000, timestamp: t(-86400), triggeredBy: 'Cron' },
    { id: 'JOB-9004', botId: 'BOT-CI-01', jobName: 'Build UI Assets', status: 'Success', durationMs: 22000, timestamp: t(-3600), triggeredBy: 'GitHub Hook' },
  ],
  monitoring: [
    { id: 'MON-101', botId: 'BOT-MON-42', metricName: 'API Gateway CPU Usage', status: 'Normal', currentValue: '42%', timestamp: t(-5) },
    { id: 'MON-102', botId: 'BOT-MON-42', metricName: 'Database Memory', status: 'Anomaly Detected', currentValue: '94% (Spike)', timestamp: t(-60) },
    { id: 'MON-103', botId: 'BOT-MON-42', metricName: 'Disk I/O Wait', status: 'Warning', currentValue: '250ms', timestamp: t(-120) },
  ],
  actions: [
    { id: 'ACT-501', botId: 'BOT-MON-42', actionName: 'Scale Up DB Replicas', reason: 'Database Memory Anomaly Detected', status: 'Done', timestamp: t(-50) },
    { id: 'ACT-502', botId: 'BOT-SCA-05', actionName: 'Scale Down Worker Nodes', reason: 'Low CPU utilization across pool', status: 'Overridden', timestamp: t(-3600) },
    { id: 'ACT-503', botId: 'BOT-SEC-99', actionName: 'Quarantine Container', reason: 'Critical CVE found', status: 'Failed', timestamp: t(-86400) },
  ],
  incidents: [
    { id: 'INC-701', botId: 'BOT-SEC-99', issue: 'Container Scanner Crash Loop', severity: 'Critical', timestamp: t(-86400), resolved: false, automatedActionTaken: 'Restart Container (Failed)' },
    { id: 'INC-702', botId: 'BOT-MON-42', issue: 'Database Memory Spike', severity: 'Warning', timestamp: t(-60), resolved: true, automatedActionTaken: 'Scale Up DB Replicas' },
    { id: 'INC-703', botId: 'BOT-SCA-05', issue: 'Auto-Scaler Rate Limit Reached', severity: 'Info', timestamp: t(-3600), resolved: false },
  ]
};

export const automationBotsApi = {
  getData: async () => ({ data: mockData, message: 'Success', status: 200 }),
  pauseBot: async (botId: string) => ({ data: { success: true }, message: 'Bot Paused', status: 200 }),
  overrideAction: async (actionId: string) => ({ data: { success: true }, message: 'Automated Action Overridden', status: 200 }),
  resolveIncident: async (incidentId: string) => ({ data: { success: true }, message: 'Incident Resolved', status: 200 }),
};
