// Components
export { InfectionSurveillancePanel } from './components/InfectionSurveillancePanel';
export { InfectionControlWorkspace } from './components/InfectionControlWorkspace';

// Pages
export { InfectionControlDashboard } from './pages/InfectionControlDashboard';

// Hooks
export { useInfectionControlDashboard, useIsolatePatient, useCompleteContainmentStep, useRaiseAuditAction, useFlagProtocol } from './hooks/useInfectionControlAnalytics';

// Types
export type * from './types/infection-control.types';
