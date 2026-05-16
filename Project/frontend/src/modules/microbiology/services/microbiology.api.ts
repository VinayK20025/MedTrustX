import type {
  MicrobiologyDashboardData, MicrobiologyKPI, CultureSample, OrganismIdentification,
  ASTResult, InfectionSurveillance, MicrobiologyAlert
} from '../types/microbiology.types';

export interface MicrobiologyFilters {
  ward?: string;
  organism?: string;
}

const mockKpis: MicrobiologyKPI[] = [
  { id: '1', title: 'Pending Cultures', value: 45, format: 'number', status: 'normal' },
  { id: '2', title: 'Positive Cultures (24h)', value: 12, format: 'number', status: 'warning' },
  { id: '3', title: 'MDR Isolates', value: 3, format: 'number', status: 'critical', actionLabel: 'View AST', actionUrl: '/dashboard/microbiology/ast' },
  { id: '4', title: 'Active Outbreaks', value: 0, format: 'number', status: 'success' },
];

const mockSamples: CultureSample[] = [
  { id: 'CULT-8821', patientName: 'Arthur Dent', patientId: 'MRN-1102', sampleType: 'Blood', collectionDate: new Date(Date.now() - 86400000).toISOString(), status: 'Growth Detected', priority: 'STAT' },
  { id: 'CULT-8822', patientName: 'Ford Prefect', patientId: 'MRN-1103', sampleType: 'Urine', collectionDate: new Date(Date.now() - 43200000).toISOString(), status: 'Incubating', priority: 'Routine' },
];

const mockIdentifications: OrganismIdentification[] = [
  { sampleId: 'CULT-8821', organismName: 'Methicillin-resistant Staphylococcus aureus (MRSA)', confidenceScore: 99.4, detectionTimeHours: 14, isMDR: true },
];

const mockAstResults: ASTResult[] = [
  { id: 'AST-1', organismName: 'MRSA', antibiotic: 'Oxacillin', class: 'Penicillin', mic: '>4', interpretation: 'Resistant' },
  { id: 'AST-2', organismName: 'MRSA', antibiotic: 'Vancomycin', class: 'Glycopeptide', mic: '<=1', interpretation: 'Sensitive' },
  { id: 'AST-3', organismName: 'MRSA', antibiotic: 'Clindamycin', class: 'Lincosamide', mic: '>2', interpretation: 'Resistant' },
];

const mockSurveillance: InfectionSurveillance[] = [
  { wardName: 'Intensive Care Unit (ICU)', activeCases: 4, dominantOrganism: 'Acinetobacter baumannii', outbreakStatus: 'Monitoring', trendMap: [1, 2, 2, 3, 4] },
  { wardName: 'Surgical Ward', activeCases: 1, dominantOrganism: 'E. coli', outbreakStatus: 'Nominal', trendMap: [0, 1, 0, 0, 1] },
];

const mockAlerts: MicrobiologyAlert[] = [
  { id: 'ALT-MB-1', sampleId: 'CULT-8821', type: 'MDR Organism', severity: 'critical', timestamp: new Date(Date.now() - 1000).toISOString(), status: 'Active', message: 'MRSA isolated from blood culture. Infection Control notified.' },
  { id: 'ALT-MB-2', type: 'Outbreak Cluster', severity: 'warning', timestamp: new Date(Date.now() - 86400000).toISOString(), status: 'Active', message: 'ICU shows upward trend for Acinetobacter baumannii over 5 days.' },
];

export const microbiologyApi = {
  getDashboardSummary: async (filters: MicrobiologyFilters) => ({
    data: {
      kpis: mockKpis,
      samples: mockSamples,
      activeSample: mockSamples[0],
      identifications: mockIdentifications,
      astResults: mockAstResults,
      surveillance: mockSurveillance,
      alerts: mockAlerts,
    } as MicrobiologyDashboardData,
    message: 'Success', status: 200,
  }),

  finalizeAst: async (sampleId: string) => ({ data: { success: true }, message: `AST report finalized for sample ${sampleId}`, status: 200 }),
  acknowledgeAlert: async (alertId: string) => ({ data: { success: true }, message: 'Alert acknowledged', status: 200 }),
};
