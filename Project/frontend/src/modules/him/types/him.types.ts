/**
 * MedTrustX — Health Information Manager (HIM) Types
 */

export interface HimKPI {
  id: string;
  title: string;
  value: string | number;
  format?: 'number' | 'percentage' | 'text';
  status: 'normal' | 'warning' | 'critical' | 'success';
  trend?: number;
  trendDirection?: 'up' | 'down' | 'neutral';
  actionLabel?: string;
  actionUrl?: string;
}

export interface DataQualityMetric {
  department: string;
  completenessScore: number; // 0-100
  accuracyScore: number;     // 0-100
  missingSignatures: number;
  uncodedRecords: number;
  status: 'Healthy' | 'At Risk' | 'Critical';
}

export interface ComplianceViolation {
  id: string;
  timestamp: string;
  category: 'HIPAA' | 'Consent' | 'Documentation' | 'Access';
  description: string;
  department: string;
  severity: 'Medium' | 'High' | 'Critical';
  status: 'Open' | 'Investigating' | 'Resolved';
}

export interface InteroperabilityStatus {
  system: string;
  protocol: 'HL7 v2' | 'FHIR' | 'DICOM';
  status: 'Online' | 'Degraded' | 'Offline';
  messagesProcessed: number;
  errorRate: number; // percentage
  lastSync: string;
}

export interface CodingStandardUpdate {
  id: string;
  codeSet: 'ICD-10' | 'SNOMED CT' | 'CPT';
  version: string;
  releaseDate: string;
  implementationStatus: 'Pending' | 'In Progress' | 'Implemented';
}

export interface HimDashboardData {
  kpis: HimKPI[];
  qualityMetrics: DataQualityMetric[];
  violations: ComplianceViolation[];
  interopStatus: InteroperabilityStatus[];
  codingUpdates: CodingStandardUpdate[];
}
