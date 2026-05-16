/* ── Multi-Tenant Isolation Manager Module ──────────────── */

// Components
export { TenantsPanel } from './components/TenantsPanel';
export { IsolationPoliciesPanel } from './components/IsolationPoliciesPanel';
export { AccessLogsPanel } from './components/AccessLogsPanel';
export { ContextPropagationPanel } from './components/ContextPropagationPanel';

// Pages
export { MultiTenantDashboard } from './pages/MultiTenantDashboard';

// Hooks
export { useMultiTenant } from './hooks/useMultiTenant';

// Types
export type * from './types/multi-tenant.types';
