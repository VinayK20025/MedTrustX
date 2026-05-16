/* ── Visiting Intensivist Module ──────────────────────── */
export { CriticalCasesList } from './components/CriticalCasesList';
export { PatientSummaryPanel } from './components/PatientSummaryPanel';
export { VitalsTrendsPanel } from './components/VitalsTrendsPanel';
export { RecommendationsPanel } from './components/RecommendationsPanel';
export { ICUInterventionsPanel, ICUCaseReviewPanel, ICUAlertsWorkPanel, ICUReportsPanel, ICUExecutiveOverview } from './components/ICUSubPanels';
export { IntensivistDashboard } from './pages/IntensivistDashboard';
export { useIntensivistDashboard, useSubmitRecommendation } from './hooks/useIntensivistAnalytics';
export type * from './types/intensivist.types';
