/* ── Medical Director Module ───────────────────────────── */
export { ClinicalKPICard } from './components/ClinicalKPICard';
export { DepartmentPanel } from './components/DepartmentPanel';
export { QualityPanel } from './components/QualityPanel';
export { SafetyPanel } from './components/SafetyPanel';
export { ProtocolPanel } from './components/ProtocolPanel';
export { MedDirectorDashboard } from './pages/MedDirectorDashboard';
export { useMedDirectorDashboard, useEscalateIncident, useResolveMedDirectorAlert } from './hooks/useMedDirectorAnalytics';
export type * from './types/med-director.types';
