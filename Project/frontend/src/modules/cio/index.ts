/* ── CIO Module ─────────────────────────────────────────── */

export { CioKPICard } from './components/CioKPICard';
export { ServicesPanel } from './components/ServicesPanel';
export { InfraPanel } from './components/InfraPanel';
export { DataPanel } from './components/DataPanel';
export { CioAlertsPanel } from './components/CioAlertsPanel';
export { IncidentPanel } from './components/IncidentPanel';

export { CIODashboard } from './pages/CIODashboard';
export { useCioDashboard, useResolveCioAlert, useAcknowledgeIncident } from './hooks/useCioAnalytics';
export type * from './types/cio.types';
