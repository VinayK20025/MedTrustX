/**
 * MedTrustX — CDSS (Clinical Decision Support System) Types
 * ──────────────────────────────────────────────────
 * Type definitions for CDSS module covering recommendations,
 * rules, alerts, and evaluations.
 */

export interface CDSSRecommendation {
  id: string;
  patientId: string;
  patientTag: string;
  recommendation: string;
  source: string;
  confidenceScore: number;
  evidenceLevel: 'A' | 'B' | 'C' | 'D' | 'E';
  category: string;
  clinicalArea: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Implemented';
  createdAt: string;
  approvedAt?: string;
  approvedBy?: string;
  feedback?: string;
}

export interface CDSSRule {
  id: string;
  name: string;
  description?: string;
  ruleType: string;
  definition: Record<string, any>;
  active: boolean;
  createdAt: string;
  lastModifiedAt: string;
  createdBy?: string;
  modifiedBy?: string;
}

export interface CDSSAlert {
  id: string;
  patientId: string;
  patientTag: string;
  encounterId?: string;
  alertType: string;
  severity: 'info' | 'warning' | 'critical';
  message: string;
  status: 'Active' | 'Acknowledged' | 'Resolved';
  triggeredAt: string;
  acknowledgedAt?: string;
  acknowledgedBy?: string;
  resolvedAt?: string;
}

export interface CDSSEvaluation {
  id: string;
  patientId: string;
  patientTag: string;
  encounterId?: string;
  inputData: Record<string, any>;
  result: Record<string, any>;
  evaluatedAt: string;
  rulesFired: string[];
  recommendationsGenerated: string[];
  alertsTriggered: string[];
}

export interface CDSSKPICard {
  id: string;
  label: string;
  value: number | string;
  subLabel: string;
  status: 'success' | 'warning' | 'critical' | 'normal';
}

export interface CDSSDashboardData {
  kpis: CDSSKPICard[];
  recommendations: CDSSRecommendation[];
  activeAlerts: CDSSAlert[];
  recentEvaluations: CDSSEvaluation[];
  topRules: CDSSRule[];
  recommendationAcceptanceRate: number;
  systemUptime: number;
  lastEvaluationTime: string;
}

export interface CDSSFilters {
  patientId?: string;
  status?: string;
  severity?: string;
  clinicalArea?: string;
  ruleType?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface CDSSEvaluateRequest {
  patientId: string;
  encounterId?: string;
  context: Record<string, any>;
}
