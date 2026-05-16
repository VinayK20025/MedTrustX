/* ── CFO Module ─────────────────────────────────────────── */

export { CfoKPICard } from './components/CfoKPICard';
export { RevenuePanel } from './components/RevenuePanel';
export { CostPanel } from './components/CostPanel';
export { CashFlowPanel } from './components/CashFlowPanel';
export { CfoAlertsPanel } from './components/CfoAlertsPanel';

export { CFODashboard } from './pages/CFODashboard';
export { useCfoDashboard, useApproveClaim, useResolveCfoAlert } from './hooks/useCfoAnalytics';
export type * from './types/cfo.types';
