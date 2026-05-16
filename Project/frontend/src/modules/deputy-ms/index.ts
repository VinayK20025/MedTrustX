/* ── Deputy MS Module ──────────────────────────────────── */
export { FlowPanel } from './components/FlowPanel';
export { WardMiniPanel } from './components/WardMiniPanel';
export { IssuesPanel } from './components/IssuesPanel';
export { TaskBoard } from './components/TaskBoard';
export { DeputyAlertsPanel, DeputyBedsPanel, DeputyIncidentsPanel, DeputyOTPanel, DeputyPatientFlowPanel, DeputyReportsPanel, DeputyStaffPanel, DeputyTasksPanel, DeputyWardsPanel } from './components/DeputyMSSubPanels';
export { DeputyMSDashboard } from './pages/DeputyMSDashboard';
export { useDeputyMSDashboard, useResolveItem, useCompleteDeputyTask } from './hooks/useDeputyMSAnalytics';
export type * from './types/deputy-ms.types';
