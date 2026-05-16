/* ── Physical Access Control Module ───────────────────────── */

// Components
export { AccessPointsPanel } from './components/AccessPointsPanel';
export { CredentialsPanel } from './components/CredentialsPanel';
export { AccessPoliciesPanel } from './components/AccessPoliciesPanel';
export { AccessLogsPanel } from './components/AccessLogsPanel';

// Pages
export { PhysicalAccessDashboard } from './pages/PhysicalAccessDashboard';
export { AccessPointsPage } from './pages/AccessPointsPage';
export { CredentialsPage } from './pages/CredentialsPage';
export { AccessPoliciesPage } from './pages/AccessPoliciesPage';
export { AccessLogsPage } from './pages/AccessLogsPage';

// Hooks
export { usePhysicalAccess } from './hooks/usePhysicalAccess';

// Types
export type * from './types/physical-access.types';
