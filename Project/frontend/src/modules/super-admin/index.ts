/* ── Super Admin Module ─────────────────────────────────── */

// Components
export { SuperAdminTenantPanel } from './components/SuperAdminTenantPanel';
export { SuperAdminPolicyPanel } from './components/SuperAdminPolicyPanel';
export { SuperAdminUserPanel } from './components/SuperAdminUserPanel';
export { SuperAdminOverridePanel } from './components/SuperAdminOverridePanel';
export { SuperAdminMonitoringPanel } from './components/SuperAdminMonitoringPanel';
export { SuperAdminAuditPanel } from './components/SuperAdminAuditPanel';
export { SuperAdminAlertPanel } from './components/SuperAdminAlertPanel';
export { SuperAdminProductivityWidget } from './components/SuperAdminProductivityWidget';

export { SuperAdminDashboard } from './pages/SuperAdminDashboard';
export { SuperAdminUsersPage } from './pages/SuperAdminUsersPage';

// Hooks
export {
  useSuperAdminDashboard,
  useSuspendTenant,
  useApplyPolicy,
  useLockUser,
  useEnforceMfa,
  useRevokeOverride,
  useAcknowledgeAlert,
  useResolveAlert,
} from './hooks/useSuperAdminAnalytics';

// Types
export type * from './types/superAdmin.types';
