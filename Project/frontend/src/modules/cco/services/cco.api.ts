/**
 * MedTrustX — CCO API Client
 * Compliance Intelligence data layer
 */
import type { CcoDashboardData } from '../types/cco.types';

const BASE_URL = '/api/v1/compliance/cco';

export interface CcoFilters {
  period?: 'current' | 'q1' | 'q2' | 'q3' | 'q4' | 'yearly';
  department?: string;
}

/* ── MOCK DATA ─────────────────────────────────────────── */

const mockKpis: CcoDashboardData['kpis'] = [
  { id: '1', title: 'Compliance Score', value: '92%', status: 'warning', delta: '-1.2% vs last quarter', actionLabel: 'View Details', actionUrl: '/dashboard/cco/monitoring' },
  { id: '2', title: 'Active Audits', value: 4, status: 'neutral', delta: '2 internal, 2 external', actionLabel: 'Audit Queue', actionUrl: '/dashboard/cco/audits' },
  { id: '3', title: 'Open Violations', value: 11, status: 'non_compliant', delta: '+3 this week', actionLabel: 'Violations', actionUrl: '/dashboard/cco/violations' },
  { id: '4', title: 'Overdue Actions', value: 5, status: 'non_compliant', delta: '2 critical', actionLabel: 'Corrective Actions', actionUrl: '/dashboard/cco/actions' },
  { id: '5', title: 'Documentation', value: '96.4%', status: 'compliant', delta: '+0.8%', actionLabel: 'Doc Status', actionUrl: '/dashboard/cco/documents' },
];

const mockAudits: CcoDashboardData['audits'] = [
  { id: 'AUD-042', title: 'NABH Quality Standards Audit', type: 'external', department: 'Hospital-wide', status: 'in_progress', auditor: 'NABH Assessor Team', scheduledDate: '2026-04-15', findingsCount: 8 },
  { id: 'AUD-041', title: 'ICU Protocol Compliance', type: 'internal', department: 'ICU', status: 'completed', auditor: 'Dr. R. Verma', scheduledDate: '2026-04-10', completedDate: '2026-04-14', findingsCount: 3, score: 94 },
  { id: 'AUD-040', title: 'Pharmacy SOP Adherence', type: 'internal', department: 'Pharmacy', status: 'overdue', auditor: 'R. Gupta', scheduledDate: '2026-04-08', findingsCount: 0 },
  { id: 'AUD-039', title: 'Fire Safety & Emergency Readiness', type: 'regulatory', department: 'Facilities', status: 'scheduled', auditor: 'Fire Dept Inspector', scheduledDate: '2026-04-28', findingsCount: 0 },
];

const mockViolations: CcoDashboardData['violations'] = [
  { id: 'VIO-118', title: 'Hand hygiene compliance below threshold in Ward B', category: 'clinical', severity: 'major', department: 'Nursing', status: 'open', detectedAt: new Date(Date.now() - 172800000).toISOString(), dueDate: new Date(Date.now() + 432000000).toISOString(), description: 'Audit observed only 72% hand hygiene compliance in Ward B against 95% standard.' },
  { id: 'VIO-117', title: 'Incomplete surgical consent documentation', category: 'documentation', severity: 'critical', department: 'Surgery', status: 'assigned', assignedTo: 'Dr. Mehta', detectedAt: new Date(Date.now() - 259200000).toISOString(), dueDate: new Date(Date.now() + 172800000).toISOString(), description: '3 surgical cases found without complete informed consent forms.' },
  { id: 'VIO-116', title: 'Expired medication found in crash cart', category: 'safety', severity: 'critical', department: 'Emergency', status: 'in_progress', assignedTo: 'Pharmacy Lead', detectedAt: new Date(Date.now() - 345600000).toISOString(), dueDate: new Date(Date.now() + 86400000).toISOString(), description: '2 expired epinephrine ampoules found during monthly crash cart check.' },
];

const mockRiskAreas: CcoDashboardData['riskAreas'] = [
  { id: 'R1', area: 'Emergency Department', riskLevel: 'high', complianceScore: 82, openViolations: 4, lastAudit: '2026-03-20' },
  { id: 'R2', area: 'Surgical Services', riskLevel: 'high', complianceScore: 85, openViolations: 3, lastAudit: '2026-04-02' },
  { id: 'R3', area: 'Nursing (Wards)', riskLevel: 'medium', complianceScore: 91, openViolations: 2, lastAudit: '2026-04-10' },
  { id: 'R4', area: 'Pharmacy', riskLevel: 'medium', complianceScore: 93, openViolations: 1, lastAudit: '2026-04-08' },
  { id: 'R5', area: 'Diagnostics', riskLevel: 'low', complianceScore: 98, openViolations: 1, lastAudit: '2026-04-12' },
];

const mockDocCompliance: CcoDashboardData['docCompliance'] = [
  { id: 'DC1', category: 'Clinical Protocols', totalRequired: 48, totalCompleted: 46, completionRate: 95.8, status: 'partial' },
  { id: 'DC2', category: 'Consent Forms', totalRequired: 120, totalCompleted: 117, completionRate: 97.5, status: 'partial' },
  { id: 'DC3', category: 'Incident Reports', totalRequired: 22, totalCompleted: 22, completionRate: 100, status: 'complete' },
  { id: 'DC4', category: 'Staff Credentials', totalRequired: 340, totalCompleted: 340, completionRate: 100, status: 'complete' },
  { id: 'DC5', category: 'Equipment Maintenance', totalRequired: 85, totalCompleted: 78, completionRate: 91.8, status: 'overdue' },
];

const mockAlerts: CcoDashboardData['alerts'] = [
  { id: 'A1', type: 'critical', category: 'Safety Violation', message: 'Expired medication in ER crash cart — immediate corrective action required.', department: 'Emergency', timestamp: new Date(Date.now() - 3600000).toISOString(), actionRequired: true },
  { id: 'A2', type: 'critical', category: 'Audit Overdue', message: 'Pharmacy SOP audit (AUD-040) is 13 days overdue. Auditor has not submitted findings.', department: 'Pharmacy', timestamp: new Date(Date.now() - 7200000).toISOString(), actionRequired: true },
  { id: 'A3', type: 'warning', category: 'Documentation Gap', message: 'Equipment maintenance logs at 91.8% — 7 records outstanding for this quarter.', department: 'Facilities', timestamp: new Date(Date.now() - 14400000).toISOString(), actionRequired: true },
  { id: 'A4', type: 'info', category: 'Audit Complete', message: 'ICU Protocol Compliance audit completed with 94% score — 3 minor findings noted.', department: 'ICU', timestamp: new Date(Date.now() - 21600000).toISOString(), actionRequired: false },
];

/* ── API Service ───────────────────────────────────────── */

export const ccoApi = {
  getDashboardSummary: async (filters: CcoFilters) => ({
    data: {
      kpis: mockKpis,
      audits: mockAudits,
      violations: mockViolations,
      riskAreas: mockRiskAreas,
      docCompliance: mockDocCompliance,
      alerts: mockAlerts,
    } as CcoDashboardData,
    message: 'Success',
    status: 200,
  }),

  assignViolation: async (violationId: string, assignee: string) => {
    return { data: { success: true }, message: 'Violation assigned', status: 200 };
  },

  resolveAlert: async (alertId: string) => {
    return { data: { success: true }, message: 'Alert resolved', status: 200 };
  },

  escalateViolation: async (violationId: string) => {
    return { data: { success: true }, message: 'Violation escalated', status: 200 };
  },
};
