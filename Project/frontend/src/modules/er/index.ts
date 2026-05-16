/* ── ER Physician Module ─────────────────────────────── */
export { TriageQueue } from './components/TriageQueue';
export { CriticalPatientPanel } from './components/CriticalPatientPanel';
export { ResourcePanel } from './components/ResourcePanel';
export { ERAlertsPanel } from './components/ERAlertsPanel';
export { ERDashboard } from './pages/ERDashboard';
export { useERDashboard, useAcknowledgeERAlert } from './hooks/useERAnalytics';
export type * from './types/er.types';
