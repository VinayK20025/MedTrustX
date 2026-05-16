/**
 * MedTrustX — Junior Resident API Client
 * Guided execution data layer
 */
import type { JRDashboardData } from '../types/jr.types';

const BASE_URL = '/api/v1/clinical/jr';

export interface JRFilters {
  view?: 'all' | 'pending_tasks';
}

/* ── MOCK DATA ─────────────────────────────────────────── */

const mockKpis: JRDashboardData['kpis'] = [
  { id: '1', title: 'Tasks Pending', value: 5, status: 'warning', delta: 'Guided Execution' },
  { id: '2', title: 'Tasks Completed', value: 12, status: 'success' },
  { id: '3', title: 'Supervisor Alerts', value: 1, status: 'critical', delta: 'Dr. Sharma' },
];

const mockPatients: JRDashboardData['patients'] = [
  { id: 'P1', patientName: 'A. Kumar', age: 45, gender: 'M', diagnosis: 'Pneumonia', status: 'stable', assignedBy: 'Dr. Sharma' },
  { id: 'P2', patientName: 'S. Devi', age: 62, gender: 'F', diagnosis: 'COPD Exacerbation', status: 'needs_review', assignedBy: 'Dr. Reddy' },
  { id: 'P3', patientName: 'R. Singh', age: 28, gender: 'M', diagnosis: 'Viral Fever', status: 'stable', assignedBy: 'Dr. Sharma' },
];

const mockTasks: JRDashboardData['tasks'] = [
  {
    id: 'T1', title: 'Perform ABG Draw', patientId: 'P2', patientName: 'S. Devi', supervisor: 'Dr. Reddy', protocolLink: 'PROT-ABG-01', status: 'pending',
    steps: [
      { id: 'S1', instruction: 'Perform Allen test to assess collateral circulation', isCompleted: false, requiresConfirmation: true },
      { id: 'S2', instruction: 'Sterilize site and draw sample using heparinized syringe', isCompleted: false },
      { id: 'S3', instruction: 'Apply pressure for 5 minutes', isCompleted: false, requiresConfirmation: true },
      { id: 'S4', instruction: 'Send sample to lab immediately on ice', isCompleted: false }
    ]
  },
  {
    id: 'T2', title: 'Administer IV Antibiotics', patientId: 'P1', patientName: 'A. Kumar', supervisor: 'Dr. Sharma', status: 'in_progress',
    steps: [
      { id: 'S1', instruction: 'Verify patient identity and allergies (No known allergies)', isCompleted: true },
      { id: 'S2', instruction: 'Administer Ceftriaxone 1g IV slowly', isCompleted: false },
      { id: 'S3', instruction: 'Flush line with saline', isCompleted: false }
    ]
  },
  {
    id: 'T3', title: 'Record Routine Vitals', patientId: 'P3', patientName: 'R. Singh', supervisor: 'Dr. Sharma', status: 'pending',
    steps: [
      { id: 'S1', instruction: 'Measure BP, HR, SpO2, and Temp', isCompleted: false },
      { id: 'S2', instruction: 'Enter values into patient chart', isCompleted: false }
    ]
  }
];

const mockProtocols: JRDashboardData['protocols'] = [
  { id: 'PR1', title: 'ABG Draw Protocol', category: 'procedure', summary: 'Step-by-step guide on safe ABG extraction and Allen Test.' },
  { id: 'PR2', title: 'Sepsis Six Bundle', category: 'guideline', summary: 'Critical actions to take within 1 hour for suspected sepsis.' },
];

const mockAlerts: JRDashboardData['alerts'] = [
  { id: 'A1', message: 'Dr. Sharma: Please re-check BP for A. Kumar. Values look borderline low.', type: 'supervisor_note', timestamp: new Date(Date.now() - 600000).toISOString() },
];

/* ── API Service ───────────────────────────────────────── */

export const jrApi = {
  getDashboardSummary: async (filters: JRFilters) => ({
    data: {
      kpis: mockKpis,
      patients: mockPatients,
      tasks: mockTasks,
      protocols: mockProtocols,
      alerts: mockAlerts,
    } as JRDashboardData,
    message: 'Success', status: 200,
  }),
  
  updateTaskStep: async (taskId: string, stepId: string) => ({ data: { success: true }, message: 'Step completed', status: 200 }),
};
