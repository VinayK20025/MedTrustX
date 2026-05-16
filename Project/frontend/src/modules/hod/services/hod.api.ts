/**
 * MedTrustX — HOD API Client
 * Specialty Department data layer
 */
import type { HODDashboardData } from '../types/hod.types';

const BASE_URL = '/api/v1/clinical/hod';

export interface HODFilters {
  department?: string;
  period?: 'today' | '7d' | '30d';
}

/* ── MOCK DATA ─────────────────────────────────────────── */

const mockKpis: HODDashboardData['kpis'] = [
  { id: '1', title: 'Active Patients', value: 86, status: 'normal', delta: '+4 today', actionLabel: 'View All', actionUrl: '/dashboard/hod/patients' },
  { id: '2', title: 'New Cases', value: 12, status: 'normal', delta: 'this shift', actionLabel: 'Cases', actionUrl: '/dashboard/hod/cases' },
  { id: '3', title: 'Discharges Today', value: 8, status: 'warning', delta: '3 pending', actionLabel: 'Expedite', actionUrl: '/dashboard/hod/patients' },
  { id: '4', title: 'Avg LOS', value: '4.8', unit: 'days', status: 'improving', delta: '-0.3d vs last month', actionLabel: 'Details', actionUrl: '/dashboard/hod/outcomes' },
  { id: '5', title: 'Critical Cases', value: 5, status: 'critical', delta: '2 ICU', actionLabel: 'Review', actionUrl: '/dashboard/hod/alerts' },
];

const mockPatients: HODDashboardData['patients'] = [
  { id: 'P1', name: 'R. Krishnan', age: 62, gender: 'M', ward: 'Cardiology Ward', bed: 'C-12', diagnosis: 'Acute MI (STEMI)', admittedAt: new Date(Date.now() - 172800000).toISOString(), attendingDoctor: 'Dr. A. Sharma', acuity: 'critical', los: 2, pendingActions: ['Repeat Echo', 'Cath Lab follow-up'] },
  { id: 'P2', name: 'S. Patel', age: 45, gender: 'F', ward: 'Cardiology Ward', bed: 'C-8', diagnosis: 'CHF exacerbation', admittedAt: new Date(Date.now() - 345600000).toISOString(), attendingDoctor: 'Dr. M. Gupta', acuity: 'high', los: 4, pendingActions: ['Diuretic titration'] },
  { id: 'P3', name: 'M. Reddy', age: 71, gender: 'M', ward: 'CCU', bed: 'CCU-3', diagnosis: 'Complete heart block — PPM done', admittedAt: new Date(Date.now() - 86400000).toISOString(), attendingDoctor: 'Dr. A. Sharma', acuity: 'high', los: 1, pendingActions: ['PPM check', 'Step-down'] },
  { id: 'P4', name: 'A. Singh', age: 38, gender: 'M', ward: 'Cardiology Ward', bed: 'C-4', diagnosis: 'Unstable angina', admittedAt: new Date(Date.now() - 259200000).toISOString(), attendingDoctor: 'Dr. R. Rao', acuity: 'moderate', los: 3, pendingActions: [] },
  { id: 'P5', name: 'L. Devi', age: 55, gender: 'F', ward: 'Cardiology Ward', bed: 'C-15', diagnosis: 'Atrial fibrillation — rate control', admittedAt: new Date(Date.now() - 518400000).toISOString(), attendingDoctor: 'Dr. M. Gupta', acuity: 'stable', los: 6, pendingActions: ['Discharge planning'] },
];

const mockStaff: HODDashboardData['staff'] = [
  { id: 'S1', name: 'Dr. A. Sharma', role: 'consultant', status: 'on_duty', activeCases: 14, maxCases: 18, shift: 'Morning' },
  { id: 'S2', name: 'Dr. M. Gupta', role: 'consultant', status: 'on_duty', activeCases: 12, maxCases: 18, shift: 'Morning' },
  { id: 'S3', name: 'Dr. R. Rao', role: 'consultant', status: 'on_call', activeCases: 8, maxCases: 18, shift: 'On-call' },
  { id: 'S4', name: 'Dr. P. Verma', role: 'registrar', status: 'on_duty', activeCases: 18, maxCases: 22, shift: 'Morning' },
  { id: 'S5', name: 'Dr. K. Nair', role: 'resident', status: 'on_duty', activeCases: 10, maxCases: 15, shift: 'Morning' },
  { id: 'S6', name: 'Nr. J. Thomas', role: 'nurse', status: 'on_duty', activeCases: 6, maxCases: 8, shift: 'Morning' },
];

const mockOutcomes: HODDashboardData['outcomes'] = [
  { metric: 'Dept Mortality', current: 1.8, previous: 2.1, benchmark: 2.5, unit: '%', trend: 'improving' },
  { metric: 'Surgical Success Rate', current: 96.2, previous: 95.8, benchmark: 95.0, unit: '%', trend: 'improving' },
  { metric: 'Complication Rate', current: 3.4, previous: 3.1, benchmark: 4.0, unit: '%', trend: 'stable' },
  { metric: 'Readmission (30d)', current: 4.2, previous: 4.8, benchmark: 5.0, unit: '%', trend: 'improving' },
];

const mockCases: HODDashboardData['cases'] = [
  { id: 'CS1', patientName: 'N. Mehta', type: 'elective', procedure: 'CABG (Triple vessel)', status: 'scheduled', scheduledAt: new Date(Date.now() + 86400000).toISOString(), surgeon: 'Dr. A. Sharma' },
  { id: 'CS2', patientName: 'V. Kumar', type: 'emergency', procedure: 'Emergency PCI (LAD)', status: 'in_progress', scheduledAt: new Date(Date.now() - 1800000).toISOString(), surgeon: 'Dr. M. Gupta' },
  { id: 'CS3', patientName: 'R. Krishnan', type: 'follow_up', status: 'pending_review', scheduledAt: new Date(Date.now() + 172800000).toISOString(), surgeon: 'Dr. A. Sharma' },
];

const mockAlerts: HODDashboardData['alerts'] = [
  { id: 'A1', type: 'critical', message: 'Patient R. Krishnan — troponin rising, repeat cath lab evaluation needed', patientName: 'R. Krishnan', timestamp: new Date(Date.now() - 1800000).toISOString(), actionRequired: true },
  { id: 'A2', type: 'warning', message: 'Dr. P. Verma approaching case limit (18/22) — consider redistribution', timestamp: new Date(Date.now() - 3600000).toISOString(), actionRequired: true },
  { id: 'A3', type: 'critical', message: 'Emergency PCI in progress — Dr. Gupta in Cath Lab, coverage needed for ward rounds', timestamp: new Date(Date.now() - 900000).toISOString(), actionRequired: true },
  { id: 'A4', type: 'info', message: 'L. Devi (AF) — discharge readiness confirmed, awaiting HOD sign-off', patientName: 'L. Devi', timestamp: new Date(Date.now() - 7200000).toISOString(), actionRequired: false },
];

/* ── API Service ───────────────────────────────────────── */

export const hodApi = {
  getDashboardSummary: async (filters: HODFilters) => ({
    data: {
      department: 'Cardiology',
      kpis: mockKpis,
      patients: mockPatients,
      staff: mockStaff,
      outcomes: mockOutcomes,
      cases: mockCases,
      alerts: mockAlerts,
    } as HODDashboardData,
    message: 'Success',
    status: 200,
  }),

  assignCase: async (caseId: string, doctorId: string) => ({ data: { success: true }, message: 'Assigned', status: 200 }),
  resolveAlert: async (alertId: string) => ({ data: { success: true }, message: 'Resolved', status: 200 }),
};
