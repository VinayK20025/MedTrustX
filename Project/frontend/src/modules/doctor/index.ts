/* ── Doctor Module ─────────────────────────────────────── */
export { PatientListPanel } from './components/PatientListPanel';
export { SchedulePanel } from './components/SchedulePanel';
export { TimelinePanel } from './components/TimelinePanel';
export { DoctorAlertsPanel } from './components/DoctorAlertsPanel';
export { DoctorDashboard } from './pages/DoctorDashboard';
export { useDoctorDashboard, useAddNote, usePrescribe } from './hooks/useDoctorAnalytics';
export type * from './types/doctor.types';
