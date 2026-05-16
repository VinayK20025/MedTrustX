/**
 * MedTrustX — Genetic Counselor (Role 146) Types
 * Risk assessment, genetic testing interpretation, and family counseling.
 */

export interface GeneticPatient {
  id: string;
  name: string;
  mrn: string;
  age: number;
  gender: string;
  referralReason: string;
  riskLevel: 'Low' | 'Moderate' | 'High';
  status: 'Pre-Test' | 'Awaiting Results' | 'Post-Test' | 'Counseling Complete';
  nextSessionDate?: string;
}

export interface FamilyMember {
  id: string;
  relation: string;
  condition: string;
  ageOfOnset?: number;
  deceased?: boolean;
}

export interface RiskAnalysis {
  condition: string;
  probabilityPercentage: number;
  riskCategory: 'Average' | 'Elevated' | 'High';
  keyFactors: string[];
}

export interface GeneticReport {
  id: string;
  testName: string;
  gene: string;
  variant: string;
  pathogenicity: 'Benign' | 'VUS' | 'Likely Pathogenic' | 'Pathogenic';
  impact: string;
  dateReported: string;
}

export interface CounselingSession {
  id: string;
  date: string;
  discussionSummary: string;
  recommendations: string[];
  patientUnderstanding: 'Excellent' | 'Good' | 'Needs Clarification';
}

export interface GeneticMetrics {
  activeCases: number;
  sessionsConducted: number;
  highRiskPatients: number;
  followUpRate: number; // percentage
}

export interface GeneticData {
  metrics: GeneticMetrics;
  patients: GeneticPatient[];
  familyHistories: Record<string, FamilyMember[]>; // keyed by patientId
  risks: Record<string, RiskAnalysis[]>;
  reports: Record<string, GeneticReport[]>;
  sessions: Record<string, CounselingSession[]>;
}
