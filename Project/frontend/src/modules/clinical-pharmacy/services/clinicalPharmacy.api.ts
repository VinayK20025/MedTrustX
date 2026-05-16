import type {
  ClinicalPharmacyDashboardData, ClinicalPharmacyKPI, PatientReviewData,
  MedicationOrder, DrugInteraction, ClinicalAlert
} from '../types/clinicalPharmacy.types';

export interface ClinicalPharmacyFilters {
  ward?: string;
  riskLevel?: string;
}

const mockKpis: ClinicalPharmacyKPI[] = [
  { id: '1', title: 'Patients Reviewed', value: 42, format: 'number', status: 'success' },
  { id: '2', title: 'Pending Reviews', value: 12, format: 'number', status: 'warning', actionLabel: 'Review Patients', actionUrl: '/dashboard/clinical-pharmacy/patients' },
  { id: '3', title: 'Major Interactions Flagged', value: 3, format: 'number', status: 'critical', actionLabel: 'View Interactions', actionUrl: '/dashboard/clinical-pharmacy/interactions' },
  { id: '4', title: 'Interventions Made', value: 7, format: 'number', status: 'normal' },
];

const mockPatients: PatientReviewData[] = [
  { id: 'CP-PT-1', patientName: 'Robert Smith', mrn: 'MRN-1122', ward: 'ICU-Bed 4', diagnosis: 'Sepsis, Acute Kidney Injury', riskLevel: 'Critical', status: 'Intervention Required', lastLabUpdate: new Date(Date.now() - 3600000).toISOString(), allergies: ['Penicillin'] },
  { id: 'CP-PT-2', patientName: 'Maria Garcia', mrn: 'MRN-3344', ward: 'Cardiology', diagnosis: 'Heart Failure, Atrial Fibrillation', riskLevel: 'High', status: 'Needs Review', lastLabUpdate: new Date(Date.now() - 7200000).toISOString(), allergies: ['Sulfa Drugs'] },
];

const mockMedications: MedicationOrder[] = [
  { id: 'MED-1', drugName: 'Vancomycin', dosage: '1g', route: 'IV', frequency: 'Q12H', prescribedBy: 'Dr. Sarah Jenkins', startDate: new Date(Date.now() - 86400000).toISOString(), status: 'Active', flags: ['Renal Adjust Needed'] },
  { id: 'MED-2', drugName: 'Piperacillin-Tazobactam', dosage: '3.375g', route: 'IV', frequency: 'Q6H', prescribedBy: 'Dr. Sarah Jenkins', startDate: new Date(Date.now() - 86400000).toISOString(), status: 'Active', flags: [] },
  { id: 'MED-3', drugName: 'Amiodarone', dosage: '400mg', route: 'PO', frequency: 'Daily', prescribedBy: 'Dr. Mark Lee', startDate: new Date(Date.now() - 172800000).toISOString(), status: 'Active', flags: [] },
  { id: 'MED-4', drugName: 'Warfarin', dosage: '5mg', route: 'PO', frequency: 'Daily', prescribedBy: 'Dr. Mark Lee', startDate: new Date(Date.now() - 432000000).toISOString(), status: 'Active', flags: [] },
];

const mockInteractions: DrugInteraction[] = [
  { id: 'INT-1', drugA: 'Amiodarone', drugB: 'Warfarin', severity: 'Major', mechanism: 'Amiodarone inhibits CYP2C9 metabolism of warfarin.', clinicalEffect: 'Increased bleeding risk; significantly elevated INR.', recommendation: 'Decrease warfarin dose by 30-50% when initiating amiodarone. Monitor INR closely.' },
];

const mockAlerts: ClinicalAlert[] = [
  { id: 'ALT-CP-1', type: 'Drug-Lab Interaction', patientId: 'MRN-1122', severity: 'critical', timestamp: new Date(Date.now() - 1800000).toISOString(), status: 'Active', message: 'Vancomycin dose unadjusted for declining eGFR (Current eGFR: 28 mL/min). Risk of nephrotoxicity.' },
  { id: 'ALT-CP-2', type: 'Drug-Drug Interaction', patientId: 'MRN-3344', severity: 'warning', timestamp: new Date(Date.now() - 3600000).toISOString(), status: 'Active', message: 'Amiodarone + Warfarin detected. Intervention required.' },
];

export const clinicalPharmacyApi = {
  getDashboardSummary: async (filters: ClinicalPharmacyFilters) => ({
    data: {
      kpis: mockKpis,
      patients: mockPatients,
      activePatient: mockPatients[0], // Sepsis pt
      activeMedications: mockMedications.slice(0, 2), // Vanc + Zosyn
      interactions: [], // No major DDI for pt 1
      alerts: [mockAlerts[0]], // Just pt 1 alert
    } as ClinicalPharmacyDashboardData,
    message: 'Success', status: 200,
  }),

  submitIntervention: async (patientId: string, medicationId: string, recommendation: string) => ({ data: { success: true }, message: `Intervention submitted to physician`, status: 200 }),
  markAsReviewed: async (patientId: string) => ({ data: { success: true }, message: `Patient profile reviewed`, status: 200 }),
  acknowledgeAlert: async (alertId: string) => ({ data: { success: true }, message: 'Alert acknowledged', status: 200 }),
};
