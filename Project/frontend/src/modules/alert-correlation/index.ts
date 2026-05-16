/* ── Alert Correlation Engine Module ────────────────────── */

// Components
export { AlertsPanel } from './components/AlertsPanel';
export { CorrelatedIncidentsPanel } from './components/CorrelatedIncidentsPanel';
export { AlertMappingsPanel } from './components/AlertMappingsPanel';
export { SuppressionRulesPanel } from './components/SuppressionRulesPanel';

// Pages
export { AlertCorrelationDashboard } from './pages/AlertCorrelationDashboard';

// Hooks
export { useAlertCorrelation } from './hooks/useAlertCorrelation';

// Types
export type * from './types/alert-correlation.types';
