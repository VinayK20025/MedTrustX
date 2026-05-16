/* ── COO Module ─────────────────────────────────────────── */

export { CooKPICard } from './components/CooKPICard';
export { PatientFlowPanel } from './components/PatientFlowPanel';
export { BedPanel } from './components/BedPanel';
export { ICUStatusPanel } from './components/ICUStatusPanel';
export { AlertsPanel } from './components/AlertsPanel';
export { TaskPanel } from './components/TaskPanel';
export { COOPatientFlowPanel, COOBedsPanel, COOQueuePanel, COONursingPanel, COOOTPanel, COOStaffPanel, COOEquipmentPanel, COOAlertsPanel, COOTasksPanel, COOEscalationsPanel, COOReportsPanel } from './components/COOSubPanels';
export { COODashboard } from './pages/COODashboard';
export { useCooDashboard, useResolveAlert, useUpdateTask } from './hooks/useCooAnalytics';
export type * from './types/coo.types';
