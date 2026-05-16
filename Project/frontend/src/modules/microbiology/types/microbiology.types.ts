/**
 * MedTrustX — Microbiologist Types
 */

export interface MicrobiologyKPI {
  id: string;
  title: string;
  value: string | number;
  format?: 'number' | 'percentage' | 'text' | 'time';
  status: 'normal' | 'warning' | 'critical' | 'success';
  trend?: number;
  trendDirection?: 'up' | 'down' | 'neutral';
  actionLabel?: string;
  actionUrl?: string;
}

export interface CultureSample {
  id: string;
  patientName: string;
  patientId: string;
  sampleType: 'Blood' | 'Urine' | 'Sputum' | 'Tissue' | 'Swab';
  collectionDate: string;
  status: 'Pending' | 'Incubating' | 'Growth Detected' | 'No Growth' | 'Finalized';
  priority: 'Routine' | 'STAT';
}

export interface OrganismIdentification {
  sampleId: string;
  organismName: string;
  confidenceScore: number;
  detectionTimeHours: number;
  isMDR: boolean; // Multi-Drug Resistant
}

export interface ASTResult {
  id: string;
  organismName: string;
  antibiotic: string;
  class: string;
  mic: string; // Minimum Inhibitory Concentration
  interpretation: 'Sensitive' | 'Intermediate' | 'Resistant';
}

export interface InfectionSurveillance {
  wardName: string;
  activeCases: number;
  dominantOrganism: string;
  outbreakStatus: 'Nominal' | 'Monitoring' | 'Outbreak Alert';
  trendMap: number[];
}

export interface MicrobiologyAlert {
  id: string;
  sampleId?: string;
  type: 'MDR Organism' | 'Outbreak Cluster' | 'Critical Growth';
  severity: 'warning' | 'critical';
  timestamp: string;
  status: 'Active' | 'Acknowledged' | 'Resolved';
  message: string;
}

export interface MicrobiologyDashboardData {
  kpis: MicrobiologyKPI[];
  samples: CultureSample[];
  activeSample?: CultureSample;
  identifications: OrganismIdentification[];
  astResults: ASTResult[];
  surveillance: InfectionSurveillance[];
  alerts: MicrobiologyAlert[];
}
