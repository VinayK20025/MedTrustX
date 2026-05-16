/* ── HOD Module ────────────────────────────────────────── */
export { PatientPanel } from './components/PatientPanel';
export { StaffPanel } from './components/StaffPanel';
export { OutcomesPanel } from './components/OutcomesPanel';
export { AlertsPanel } from './components/AlertsPanel';
export { HODDashboard } from './pages/HODDashboard';
export { useHODDashboard, useAssignCase, useResolveHODAlert } from './hooks/useHODAnalytics';
export type * from './types/hod.types';
