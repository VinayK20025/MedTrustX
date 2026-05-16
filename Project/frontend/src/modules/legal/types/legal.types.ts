/**
 * MedTrustX — Legal Advisor (Role 108) Types
 * Secure case and compliance management, medico-legal litigation, and contracts.
 */

export interface LegalKPI {
  id: string;
  label: string;
  value: string | number;
  status: 'normal' | 'warning' | 'critical' | 'success';
}

export interface LegalCase {
  id: string;
  title: string;
  type: 'Medical Negligence' | 'Labor Dispute' | 'Contractual Breach' | 'Patient Rights' | 'Regulatory';
  severity: 'High' | 'Medium' | 'Low';
  status: 'Open' | 'In Court' | 'Settlement' | 'Closed';
  parties: string; // e.g., "Hospital vs John Doe"
  department?: string;
  openedAt: string;
  nextHearingDate?: string;
}

export interface CaseTimelineEvent {
  id: string;
  caseId: string;
  date: string;
  event: string;
  actor: string;
}

export interface LegalDocument {
  id: string;
  caseId?: string; // Optional, could be general contract
  title: string;
  type: 'Court Notice' | 'Affidavit' | 'Settlement Agreement' | 'Contract' | 'Evidence';
  status: 'Draft' | 'Final' | 'Signed' | 'In Review';
  uploadedAt: string;
  isConfidential: boolean;
}

export interface VendorContract {
  id: string;
  vendor: string;
  service: string;
  status: 'Active' | 'Expiring Soon' | 'Expired' | 'Breach';
  expiryDate: string;
  value: string;
}

export interface ComplianceRegulation {
  id: string;
  regulation: string; // e.g., Bio-medical Waste Rules, PCPNDT Act
  status: 'Compliant' | 'At Risk' | 'Non-Compliant';
  lastAudit: string;
}

export interface LegalDashboardData {
  kpis: LegalKPI[];
  cases: LegalCase[];
  timeline: CaseTimelineEvent[];
  documents: LegalDocument[];
  contracts: VendorContract[];
  compliance: ComplianceRegulation[];
}
