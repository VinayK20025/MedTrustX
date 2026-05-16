/* ── CCO Module ─────────────────────────────────────────── */

export { CcoKPICard } from './components/CcoKPICard';
export { AuditPanel } from './components/AuditPanel';
export { ViolationsPanel } from './components/ViolationsPanel';
export { RiskPanel } from './components/RiskPanel';
export { DocsPanel } from './components/DocsPanel';

export { CCODashboard } from './pages/CCODashboard';
export { useCcoDashboard, useAssignViolation, useResolveCcoAlert, useEscalateViolation } from './hooks/useCcoAnalytics';
export type * from './types/cco.types';
