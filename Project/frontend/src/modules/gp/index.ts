/* ── General Physician Module ─────────────────────────── */
export { QueuePanel } from './components/QueuePanel';
export { ConsultationPanel } from './components/ConsultationPanel';
export { QuickPrescriptionPanel } from './components/QuickPrescriptionPanel';
export { ReferralPanel } from './components/ReferralPanel';
export { GPDashboard } from './pages/GPDashboard';
export { useGPDashboard, useCallNextPatient, useSubmitConsultation } from './hooks/useGPAnalytics';
export type * from './types/gp.types';
