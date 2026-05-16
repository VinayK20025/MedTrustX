/* ── Superintendent Module ─────────────────────────────── */
export { SuperKPICard } from './components/SuperKPICard';
export { PatientFlowPanel } from './components/PatientFlowPanel';
export { WardPanel } from './components/WardPanel';
export { ICUOTPanel } from './components/ICUOTPanel';
export { TaskPanel } from './components/TaskPanel';
export { SuperAlertsPanel, SuperReportsPanel, SuperTasksPanel, SuperWardsPanel, SuperIncidentsPanel, SuperPatientFlowPanel, SuperOTPanel, SuperStaffPanel } from './components/SuperintendentSubPanels';
export { SuperintendentDashboard } from './pages/SuperintendentDashboard';
export { useSuperintendentDashboard, useResolveFlowItem, useResolveSuperAlert, useCompleteTask } from './hooks/useSuperintendentAnalytics';
export type * from './types/superintendent.types';
