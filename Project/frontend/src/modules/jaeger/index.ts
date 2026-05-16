/* ── Jaeger Tracing Service Module ────────────────────────── */

// Components
export { TracesPanel } from './components/TracesPanel';
export { SpansPanel } from './components/SpansPanel';
export { DependenciesPanel } from './components/DependenciesPanel';

// Pages
export { JaegerDashboard } from './pages/JaegerDashboard';

// Hooks
export { useJaeger } from './hooks/useJaeger';

// Types
export type * from './types/jaeger.types';
