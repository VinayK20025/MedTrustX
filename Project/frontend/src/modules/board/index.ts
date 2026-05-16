/* ── Board/Executive Module ─────────────────────────────── */

// Components
export { KPICard } from './components/KPICard';
export { ChartCard } from './components/ChartCard';
export { FinancialPanel } from './components/FinancialPanel';
export { ClinicalQualityPanel } from './components/ClinicalQualityPanel';
export { OperationsPanel } from './components/OperationsPanel';
export { RiskAlertsPanel } from './components/RiskAlertsPanel';
export { MultiHospitalComparison } from './components/MultiHospitalComparison';
export { BoardFinancialPanel, BoardClinicalPanel, BoardOperationsPanel, BoardCompliancePanel, BoardReportsPanel, BoardAuditPanel, BoardAccessPanel } from './components/BoardSubPanels';

// Pages
export { ExecutiveDashboard } from './pages/ExecutiveDashboard';

// Hooks
export { 
  useBoardSummary,
  useFinancialIntelligence,
  useClinicalQuality,
  useOperationsSummary,
  useRiskAlerts,
  useHospitalComparison
} from './hooks/useBoardAnalytics';

// Types
export type * from './types/board.types';
