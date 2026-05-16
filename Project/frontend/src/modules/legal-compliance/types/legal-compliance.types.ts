/**
 * MedTrustX — Legal Compliance Officer (Role 110) Types
 * Regulatory enforcement, statutory reporting, and legal risk management.
 */

export interface ComplianceKPI {
  id: string;
  label: string;
  value: string | number;
  subLabel?: string;
  status: 'normal' | 'warning' | 'critical' | 'success';
}

export interface HospitalLicense {
  id: string;
  name: string;
  type: 'Fire Safety' | 'Blood Bank' | 'Pharmacy' | 'Radiology (AERB)' | 'General Establishment';
  expiryDate: string;
  status: 'Active' | 'Expiring Soon' | 'Expired';
  renewalStatus: 'Not Started' | 'In Progress' | 'Submitted';
}

export interface RegulatoryLaw {
  id: string;
  law: string;
  departmentScope: string;
  complianceStatus: 'Compliant' | 'At Risk' | 'Non-Compliant';
  lastAuditDate: string;
}

export interface ComplianceViolation {
  id: string;
  issue: string;
  severity: 'Critical' | 'High' | 'Medium';
  department: string;
  status: 'Open' | 'Investigating' | 'Resolved';
  detectedAt: string;
  penaltyRisk: string; // e.g., "License Suspension", "$10,000 Fine"
}

export interface ComplianceAuditChecklist {
  id: string;
  title: string;
  department: string;
  totalChecks: number;
  completedChecks: number;
  dueDate: string;
  status: 'Pending' | 'In Progress' | 'Completed';
}

export interface LegalComplianceData {
  kpis: ComplianceKPI[];
  licenses: HospitalLicense[];
  regulations: RegulatoryLaw[];
  violations: ComplianceViolation[];
  checklists: ComplianceAuditChecklist[];
}
