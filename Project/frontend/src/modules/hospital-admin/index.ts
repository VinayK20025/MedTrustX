// Components
export { AdminBedManagementPanel } from './components/AdminBedManagementPanel';
export { AdminDepartmentPerformancePanel } from './components/AdminDepartmentPerformancePanel';
export { AdminAlertsPanel } from './components/AdminAlertsPanel';

// Pages
export { HospitalAdminDashboard } from './pages/HospitalAdminDashboard';

// Hooks
export {
  useAdminDashboard,
  useAcknowledgeAlert,
  useTriggerBedDiversion,
} from './hooks/useAdminAnalytics';

// Types
export type * from './types/admin.types';
