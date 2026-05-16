/**
 * MedTrustX — Medical Director API Client
 * Clinical Governance data layer
 */
import type { MedDirectorDashboardData } from '../types/med-director.types';

const BASE_URL = '/api/v1/clinical/med-director';

export interface MedDirectorFilters {
  period?: 'today' | '7d' | '30d' | '90d';
  department?: string;
}

/* ── MOCK DATA ─────────────────────────────────────────── */

const mockKpis: MedDirectorDashboardData['kpis'] = [
  { id: '1', title: 'Mortality Rate', value: '2.1%', status: 'normal', benchmark: 'NABH: <3%', delta: '-0.3% vs Q3', actionLabel: 'M&M Review', actionUrl: '/dashboard/med-director/outcomes' },
  { id: '2', title: 'Infection Rate', value: '1.8%', status: 'warning', benchmark: 'Target: <1.5%', delta: '+0.2%', actionLabel: 'IC Dashboard', actionUrl: '/dashboard/med-director/safety' },
  { id: '3', title: 'Readmission (30d)', value: '4.6%', status: 'normal', benchmark: 'Target: <5%', delta: '-0.4%', actionLabel: 'Details', actionUrl: '/dashboard/med-director/outcomes' },
  { id: '4', title: 'Avg LOS', value: '4.2', unit: 'days', status: 'improving', benchmark: 'Target: 4.5d', delta: '-0.3d', actionLabel: 'By Dept', actionUrl: '/dashboard/med-director/departments' },
  { id: '5', title: 'Safety Incidents', value: 7, status: 'warning', delta: '+2 this week', actionLabel: 'Review', actionUrl: '/dashboard/med-director/safety' },
];

const mockDepartments: MedDirectorDashboardData['departments'] = [
  { id: 'D1', name: 'ICU', mortalityRate: 5.2, infectionRate: 3.1, readmissionRate: 2.8, avgLOS: 7.4, occupancy: 92, status: 'attention', openIncidents: 3 },
  { id: 'D2', name: 'General Surgery', mortalityRate: 1.1, infectionRate: 2.4, readmissionRate: 3.2, avgLOS: 5.1, occupancy: 78, status: 'attention', openIncidents: 2 },
  { id: 'D3', name: 'Medicine (Wards)', mortalityRate: 1.8, infectionRate: 0.9, readmissionRate: 5.6, avgLOS: 3.8, occupancy: 85, status: 'optimal', openIncidents: 1 },
  { id: 'D4', name: 'Obstetrics', mortalityRate: 0.2, infectionRate: 0.6, readmissionRate: 1.4, avgLOS: 2.8, occupancy: 68, status: 'optimal', openIncidents: 0 },
  { id: 'D5', name: 'Emergency', mortalityRate: 3.8, infectionRate: 1.2, readmissionRate: 8.4, avgLOS: 1.2, occupancy: 95, status: 'critical', openIncidents: 4 },
  { id: 'D6', name: 'Pediatrics', mortalityRate: 0.4, infectionRate: 0.8, readmissionRate: 2.2, avgLOS: 3.1, occupancy: 62, status: 'optimal', openIncidents: 0 },
];

const mockOutcomes: MedDirectorDashboardData['outcomes'] = [
  { metric: 'Hospital Mortality', current: 2.1, previous: 2.4, benchmark: 3.0, unit: '%', trend: 'improving' },
  { metric: 'HAI Rate', current: 1.8, previous: 1.6, benchmark: 1.5, unit: '%', trend: 'declining' },
  { metric: 'Surgical Site Infection', current: 1.2, previous: 1.5, benchmark: 2.0, unit: '%', trend: 'improving' },
  { metric: 'Falls per 1000 Patient Days', current: 0.8, previous: 1.1, benchmark: 1.0, unit: '', trend: 'improving' },
  { metric: 'Blood Culture Contamination', current: 2.4, previous: 2.6, benchmark: 3.0, unit: '%', trend: 'improving' },
  { metric: 'CLABSI Rate', current: 0.9, previous: 0.7, benchmark: 1.0, unit: '/1000 CL days', trend: 'declining' },
];

const mockIncidents: MedDirectorDashboardData['incidents'] = [
  { id: 'SI-2042', title: 'Wrong dosage administered — insulin overdose', type: 'medication_error', severity: 'serious', department: 'Medicine', status: 'investigating', reportedAt: new Date(Date.now() - 86400000).toISOString(), assignedTo: 'Dr. R. Sharma', description: 'Patient received 40U instead of 14U insulin. Detected within 30 min, corrected with glucose infusion.' },
  { id: 'SI-2041', title: 'Post-op wound infection — cholecystectomy', type: 'infection', severity: 'moderate', department: 'Surgery', status: 'rca_pending', reportedAt: new Date(Date.now() - 172800000).toISOString(), assignedTo: 'IC Team', description: 'SSI detected on POD 5. Culture pending. Antibiotic escalation initiated.' },
  { id: 'SI-2040', title: 'Patient fall from bed — ICU', type: 'fall', severity: 'moderate', department: 'ICU', status: 'open', reportedAt: new Date(Date.now() - 259200000).toISOString(), description: 'Sedated patient fell while attempting to get up unassisted. CT head ordered — no acute finding.' },
  { id: 'SI-2039', title: 'Near-miss: wrong blood type prepared', type: 'diagnostic', severity: 'near_miss', department: 'Blood Bank', status: 'resolved', reportedAt: new Date(Date.now() - 345600000).toISOString(), assignedTo: 'Lab QC', description: 'Cross-match error caught during double-check before transfusion. No patient harm.' },
];

const mockProtocols: MedDirectorDashboardData['protocols'] = [
  { id: 'P1', name: 'Sepsis Bundle Protocol', department: 'ICU / Emergency', version: 'v3.2', status: 'active', adherenceRate: 88, lastReviewed: '2026-03-15', nextReview: '2026-09-15' },
  { id: 'P2', name: 'Surgical Safety Checklist', department: 'OT', version: 'v2.1', status: 'active', adherenceRate: 96, lastReviewed: '2026-02-01', nextReview: '2026-08-01' },
  { id: 'P3', name: 'DVT Prophylaxis Protocol', department: 'All Surgical', version: 'v1.4', status: 'under_review', adherenceRate: 72, lastReviewed: '2025-12-01', nextReview: '2026-06-01' },
  { id: 'P4', name: 'Hand Hygiene SOP', department: 'Hospital-wide', version: 'v4.0', status: 'active', adherenceRate: 91, lastReviewed: '2026-01-10', nextReview: '2026-07-10' },
];

const mockAlerts: MedDirectorDashboardData['alerts'] = [
  { id: 'A1', type: 'critical', category: 'Infection Threshold', message: 'HAI rate (1.8%) exceeded NABH threshold of 1.5%. Immediate IC review recommended.', department: 'Hospital-wide', timestamp: new Date(Date.now() - 3600000).toISOString(), actionRequired: true },
  { id: 'A2', type: 'warning', category: 'Protocol Adherence', message: 'DVT prophylaxis adherence at 72% — below 85% target. Surgery dept flagged.', department: 'Surgery', timestamp: new Date(Date.now() - 7200000).toISOString(), actionRequired: true },
  { id: 'A3', type: 'critical', category: 'Patient Safety', message: 'Medication error SI-2042 classified as serious — insulin overdose in Medicine ward.', department: 'Medicine', timestamp: new Date(Date.now() - 86400000).toISOString(), actionRequired: true },
  { id: 'A4', type: 'info', category: 'Outcome Improvement', message: 'Hospital mortality rate improved to 2.1% from 2.4% — Q4 target on track.', timestamp: new Date(Date.now() - 14400000).toISOString(), actionRequired: false },
];

/* ── API Service ───────────────────────────────────────── */

export const medDirectorApi = {
  getDashboardSummary: async (filters: MedDirectorFilters) => ({
    data: {
      kpis: mockKpis,
      departments: mockDepartments,
      outcomes: mockOutcomes,
      incidents: mockIncidents,
      protocols: mockProtocols,
      alerts: mockAlerts,
    } as MedDirectorDashboardData,
    message: 'Success',
    status: 200,
  }),

  escalateIncident: async (incidentId: string) => {
    return { data: { success: true }, message: 'Incident escalated', status: 200 };
  },

  resolveAlert: async (alertId: string) => {
    return { data: { success: true }, message: 'Alert resolved', status: 200 };
  },
};
