import type { DataEngineerData } from '../types/data.types';

const t = (sec: number) => new Date(Date.now() + sec * 1000).toISOString();

const mockData: DataEngineerData = {
  metrics: {
    pipelinesActive: 8,
    pipelineSuccessRate: 91,
    totalRecordsToday: 4_820_000,
    tbProcessedToday: 1.24,
    avgLatencyMs: 340,
    failedPipelines: 2,
    openAlerts: 3,
  },
  pipelines: [
    { id: 'PL-001', name: 'EHR → Data Warehouse ETL', description: 'Daily full extract of patient records, encounters, and vitals from Epic EHR to Snowflake DWH', sourceSystem: 'Epic EHR', targetSystem: 'Snowflake DWH', type: 'ETL', status: 'Success', schedule: 'Daily', lastRunAt: t(-3600), durationSeconds: 1842, recordsProcessed: 1_240_000, errorCount: 0, successRate: 100 },
    { id: 'PL-002', name: 'Lab Results → Analytics Stream', description: 'Real-time streaming of lab results from Cobas LIS to Kafka then Elasticsearch', sourceSystem: 'Cobas LIS', targetSystem: 'Kafka → Elasticsearch', type: 'Stream', status: 'Running', schedule: 'Real-time', lastRunAt: t(-60), durationSeconds: 0, recordsProcessed: 84_200, errorCount: 0, successRate: 99.8 },
    { id: 'PL-003', name: 'Billing → Financial DWH', description: 'Hourly ELT of billing transactions, claims, and payments into financial warehouse', sourceSystem: 'Billing System', targetSystem: 'BigQuery DWH', type: 'ELT', status: 'Failed', schedule: 'Hourly', lastRunAt: t(-2100), durationSeconds: 487, recordsProcessed: 0, errorCount: 14, successRate: 0 },
    { id: 'PL-004', name: 'IoMT Vitals → FHIR Store', description: 'Real-time ICU monitor data (Philips) to FHIR Observation resources', sourceSystem: 'Philips ICU Monitors', targetSystem: 'Azure FHIR Store', type: 'Stream', status: 'Running', schedule: 'Real-time', lastRunAt: t(-5), durationSeconds: 0, recordsProcessed: 2_110_000, errorCount: 0, successRate: 99.9 },
    { id: 'PL-005', name: 'PACS Metadata → Imaging Index', description: 'Batch sync of DICOM metadata from Agfa PACS to imaging search index', sourceSystem: 'Agfa PACS', targetSystem: 'Imaging Index ES', type: 'Batch', status: 'Success', schedule: 'Hourly', lastRunAt: t(-900), durationSeconds: 312, recordsProcessed: 48_400, errorCount: 0, successRate: 100 },
    { id: 'PL-006', name: 'PHI Masking Pipeline', description: 'De-identifies PHI fields for research and analytics datasets', sourceSystem: 'Epic EHR', targetSystem: 'Research DWH', type: 'ETL', status: 'Failed', schedule: 'Daily', lastRunAt: t(-7200), durationSeconds: 210, recordsProcessed: 0, errorCount: 6, successRate: 0 },
    { id: 'PL-007', name: 'Government HMIS Export', description: 'Weekly batch export of aggregated clinical data to National Health Mission portal', sourceSystem: 'Snowflake DWH', targetSystem: 'NHA HMIS API', type: 'Batch', status: 'Queued', schedule: 'Weekly', lastRunAt: t(-604800), durationSeconds: 0, recordsProcessed: 0, errorCount: 0, successRate: 0 },
    { id: 'PL-008', name: 'ML Feature Engineering Pipeline', description: 'Daily computation of patient risk scores and readmission prediction features', sourceSystem: 'Snowflake DWH', targetSystem: 'ML Feature Store', type: 'ETL', status: 'Success', schedule: 'Daily', lastRunAt: t(-14400), durationSeconds: 2840, recordsProcessed: 320_000, errorCount: 0, successRate: 100 },
  ],
  sources: [
    { id: 'SRC-001', name: 'Epic EHR', type: 'EHR', status: 'Connected', latencyMs: 142, recordsToday: 1_240_000, lastSyncAt: t(-12), encryption: true },
    { id: 'SRC-002', name: 'Cobas LIS', type: 'LIS', status: 'Connected', latencyMs: 88, recordsToday: 84_200, lastSyncAt: t(-5), encryption: true },
    { id: 'SRC-003', name: 'Billing System', type: 'Billing', status: 'Degraded', latencyMs: 1840, recordsToday: 12_400, lastSyncAt: t(-2100), encryption: true },
    { id: 'SRC-004', name: 'Agfa PACS', type: 'PACS', status: 'Connected', latencyMs: 340, recordsToday: 48_400, lastSyncAt: t(-900), encryption: true },
    { id: 'SRC-005', name: 'Philips ICU Monitors', type: 'IoMT', status: 'Connected', latencyMs: 45, recordsToday: 2_110_000, lastSyncAt: t(-5), encryption: true },
    { id: 'SRC-006', name: 'NHA HMIS Portal', type: 'External', status: 'Connected', latencyMs: 2100, recordsToday: 0, lastSyncAt: t(-604800), encryption: true },
  ],
  qualityRules: [
    { id: 'QR-001', pipelineId: 'PL-001', rule: 'No null Patient ID', description: 'Every record must have a non-null PatientID field', status: 'Passed', failCount: 0, lastChecked: t(-3600) },
    { id: 'QR-002', pipelineId: 'PL-001', rule: 'Date range validation', description: 'Encounter dates must be within valid hospital operation range', status: 'Passed', failCount: 0, lastChecked: t(-3600) },
    { id: 'QR-003', pipelineId: 'PL-003', rule: 'Amount > 0 check', description: 'All billing transactions must have amount > 0', status: 'Failed', failCount: 14, lastChecked: t(-2100) },
    { id: 'QR-004', pipelineId: 'PL-003', rule: 'ICD-10 code format', description: 'Diagnosis codes must match ICD-10 regex pattern', status: 'Warning', failCount: 3, lastChecked: t(-2100) },
    { id: 'QR-005', pipelineId: 'PL-006', rule: 'PHI field masking', description: 'Name, DOB, address must be de-identified before loading', status: 'Failed', failCount: 6, lastChecked: t(-7200) },
    { id: 'QR-006', pipelineId: 'PL-002', rule: 'LOINC code present', description: 'Lab results must carry valid LOINC observation code', status: 'Passed', failCount: 0, lastChecked: t(-60) },
  ],
  securityPolicies: [
    { id: 'SP-001', name: 'AES-256 Encryption at Rest', type: 'Encryption', status: 'Enabled', scope: 'All pipelines', lastAudit: t(-86400) },
    { id: 'SP-002', name: 'TLS 1.3 Encryption in Transit', type: 'Encryption', status: 'Enabled', scope: 'All data connections', lastAudit: t(-86400) },
    { id: 'SP-003', name: 'Role-Based Data Access', type: 'Access Control', status: 'Enabled', scope: 'Snowflake DWH, BigQuery', lastAudit: t(-172800) },
    { id: 'SP-004', name: 'PHI Field Masking', type: 'Masking', status: 'Enabled', scope: 'Research DWH, Analytics DB', lastAudit: t(-86400) },
    { id: 'SP-005', name: 'Pipeline Audit Logging', type: 'Audit Log', status: 'Enabled', scope: 'All pipelines', lastAudit: t(-3600) },
    { id: 'SP-006', name: 'Data Retention — 7 Years', type: 'Retention', status: 'Enabled', scope: 'Clinical data', lastAudit: t(-604800) },
  ],
  alerts: [
    { id: 'ALT-001', pipelineId: 'PL-003', title: 'Billing ETL pipeline failed — 14 validation errors', severity: 'Critical', status: 'Firing', firedAt: t(-2100), detail: 'Amount > 0 check failing on 14 records. Possible data corruption in source Billing System. Connection latency at 1840ms — SLA breach.' },
    { id: 'ALT-002', pipelineId: 'PL-006', title: 'PHI masking pipeline failure — data compliance risk', severity: 'Critical', status: 'Firing', firedAt: t(-7200), detail: 'PHI de-identification step failed. 6 records may have unmasked PHI in Research DWH. Immediate review required per HIPAA policy.' },
    { id: 'ALT-003', pipelineId: 'PL-003', title: 'Billing source latency SLA breach (1840ms)', severity: 'High', status: 'Acknowledged', firedAt: t(-2200), detail: 'Billing System connection latency exceeds 500ms SLA threshold. Downstream pipelines degraded.' },
  ],
  logs: [
    { id: 'LOG-001', timestamp: t(-60), pipelineId: 'PL-002', level: 'INFO', message: 'Stream checkpoint committed — 84,200 records processed since midnight' },
    { id: 'LOG-002', timestamp: t(-2100), pipelineId: 'PL-003', level: 'ERROR', message: 'QualityRule QR-003 failed: 14 records with amount=0 in billing_transactions. Pipeline halted.' },
    { id: 'LOG-003', timestamp: t(-2140), pipelineId: 'PL-003', level: 'ERROR', message: 'Source connection degraded: billing-db latency=1840ms (SLA=500ms)' },
    { id: 'LOG-004', timestamp: t(-3600), pipelineId: 'PL-001', level: 'INFO', message: 'EHR ETL completed successfully: 1,240,000 records, 0 errors, duration=1842s' },
    { id: 'LOG-005', timestamp: t(-7200), pipelineId: 'PL-006', level: 'ERROR', message: 'PHI masking failed on field patient.name — masker service returned HTTP 500' },
    { id: 'LOG-006', timestamp: t(-900), pipelineId: 'PL-005', level: 'INFO', message: 'PACS metadata batch completed: 48,400 DICOM records indexed, duration=312s' },
  ],
};

export const dataApi = {
  getData: async () => ({ data: mockData, message: 'Success', status: 200 }),
  retryPipeline: async (id: string) => ({ data: { success: true }, message: 'Pipeline queued for retry', status: 200 }),
  acknowledgeAlert: async (id: string) => ({ data: { success: true }, message: 'Alert acknowledged', status: 200 }),
};
