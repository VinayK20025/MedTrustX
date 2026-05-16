/* ── CEO Module ─────────────────────────────────────────── */

// Components
export { ActionableKPICard } from './components/ActionableKPICard';
export { TaskPanel } from './components/TaskPanel';
export { AlertsPanel } from './components/AlertsPanel';
export { OperationsCommandGrid } from './components/OperationsCommandGrid';
export { FinancialOverviewPanel } from './components/FinancialOverviewPanel';
export { CEOTasksPanel, CEOBedsPanel, CEOOTPanel, CEOClinicalPanel, CEOCompliancePanel, CEOEscalationsPanel, CEOReportsPanel } from './components/CEOSubPanels';

// Pages
export { CEODashboard } from './pages/CEODashboard';

// Hooks
export { useCeoDashboard, useApproveTask, useEscalateAlert } from './hooks/useCeoAnalytics';

// Types
export type * from './types/ceo.types';
