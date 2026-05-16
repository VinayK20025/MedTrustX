export interface ClinicalPathway {
  id: string;
  name: string;
  description: string | null;
}

export interface PathwayStep {
  id: string;
  pathway_id: string;
  step_name: string;
  sequence: number;
  metadata: Record<string, any>;
}

export interface PatientJourney {
  id: string;
  patient_id: string;
  pathway_id: string;
  current_step: number;
  status: string;
}

export interface PathwayVariance {
  id: string;
  journey_id: string;
  expected_step: number;
  actual_step: number;
  variance_reason: string | null;
}
