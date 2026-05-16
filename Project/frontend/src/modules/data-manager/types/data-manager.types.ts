/**
 * MedTrustX — Data Manager (Clinical Trials - Role 131) Types
 * Data integrity, validation engine, query management, and regulatory submission.
 */

export interface DataMgrKPI {
  id: string;
  label: string;
  value: string | number;
  status: 'normal' | 'warning' | 'critical' | 'success';
}

export interface TrialDataset {
  id: string;
  name: string;
  study: string;
  totalRecords: number;
  errorCount: number;
  completeness: number; // percentage
  status: 'Active' | 'Locked' | 'Submitted';
}

export interface DataQuery {
  id: string;
  field: string;
  subject: string;
  site: string;
  issue: string;
  status: 'Open' | 'Responded' | 'Resolved' | 'Closed';
  raisedAt: string;
}

export interface ValidationRule {
  id: string;
  rule: string;
  category: 'Range' | 'Completeness' | 'Logic' | 'Format';
  failCount: number;
  status: 'Pass' | 'Fail';
}

export interface DataMgrData {
  kpis: DataMgrKPI[];
  datasets: TrialDataset[];
  queries: DataQuery[];
  validationRules: ValidationRule[];
}
