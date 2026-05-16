import type {
  HimDashboardData, HimKPI, DataQualityMetric,
  ComplianceViolation, InteroperabilityStatus, CodingStandardUpdate
} from '../types/him.types';

export interface HimFilters {
  department?: string;
}

const mockKpis: HimKPI[] = [
  { id: '1', title: 'Data Completeness', value: '94.2%', format: 'text', status: 'normal', actionLabel: 'View Gaps', actionUrl: '/dashboard/him/quality' },
  { id: '2', title: 'Coding Accuracy', value: '98.5%', format: 'text', status: 'success' },
  { id: '3', title: 'Compliance Alerts', value: 3, format: 'number', status: 'critical', actionLabel: 'Review Audits', actionUrl: '/dashboard/him/compliance' },
  { id: '4', title: 'FHIR API Uptime', value: '99.9%', format: 'text', status: 'success' },
];

const mockQuality: DataQualityMetric[] = [
  { department: 'Emergency (ER)', completenessScore: 88, accuracyScore: 92, missingSignatures: 14, uncodedRecords: 45, status: 'At Risk' },
  { department: 'Cardiology', completenessScore: 99, accuracyScore: 98, missingSignatures: 2, uncodedRecords: 5, status: 'Healthy' },
  { department: 'Surgery', completenessScore: 76, accuracyScore: 89, missingSignatures: 28, uncodedRecords: 12, status: 'Critical' },
];

const mockViolations: ComplianceViolation[] = [
  { id: 'VIO-001', timestamp: new Date(Date.now() - 3600000).toISOString(), category: 'Consent', description: 'Surgical procedure logged without signed informed consent document in EHR.', department: 'Surgery', severity: 'Critical', status: 'Open' },
  { id: 'VIO-002', timestamp: new Date(Date.now() - 86400000).toISOString(), category: 'Access', description: 'Unauthorized chart access detected outside of assigned ward.', department: 'Internal Medicine', severity: 'High', status: 'Investigating' },
];

const mockInterop: InteroperabilityStatus[] = [
  { system: 'State Immunization Registry', protocol: 'HL7 v2', status: 'Online', messagesProcessed: 1420, errorRate: 0.1, lastSync: new Date().toISOString() },
  { system: 'External Lab Partner (Quest)', protocol: 'FHIR', status: 'Degraded', messagesProcessed: 540, errorRate: 4.5, lastSync: new Date(Date.now() - 600000).toISOString() },
  { system: 'PACS Imaging Server', protocol: 'DICOM', status: 'Online', messagesProcessed: 890, errorRate: 0.0, lastSync: new Date().toISOString() },
];

const mockUpdates: CodingStandardUpdate[] = [
  { id: 'UPD-ICD-2027', codeSet: 'ICD-10', version: 'FY2027 v1.0', releaseDate: new Date(Date.now() + 5184000000).toISOString(), implementationStatus: 'Pending' },
];

export const himApi = {
  getDashboardSummary: async (filters: HimFilters) => ({
    data: {
      kpis: mockKpis,
      qualityMetrics: mockQuality,
      violations: mockViolations,
      interopStatus: mockInterop,
      codingUpdates: mockUpdates,
    } as HimDashboardData,
    message: 'Success', status: 200,
  }),

  resolveViolation: async (violationId: string, resolutionNotes: string) => ({ data: { success: true }, message: `Violation resolved`, status: 200 }),
  triggerInteropSync: async (systemId: string) => ({ data: { success: true }, message: `Forced sync initiated for ${systemId}`, status: 200 }),
  approveStandardUpdate: async (updateId: string) => ({ data: { success: true }, message: `Coding standard update approved for rollout`, status: 200 }),
};
