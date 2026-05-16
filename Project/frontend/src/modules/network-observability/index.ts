/* ── Network Observability Module ─────────────────────────── */

// Components
export { NetworkFlowsPanel } from './components/NetworkFlowsPanel';
export { TrafficMetricsPanel } from './components/TrafficMetricsPanel';
export { DependencyMapPanel } from './components/DependencyMapPanel';
export { AnomaliesPanel } from './components/AnomaliesPanel';

// Pages
export { NetworkObservabilityDashboard } from './pages/NetworkObservabilityDashboard';

// Hooks
export { useNetworkObservability } from './hooks/useNetworkObservability';

// Types
export type * from './types/network-observability.types';
