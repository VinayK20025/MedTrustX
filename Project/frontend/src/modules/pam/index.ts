// Components
export { PamAccessPanel } from './components/PamAccessPanel';
export { PamRequestPanel } from './components/PamRequestPanel';
export { PamSessionPanel } from './components/PamSessionPanel';
export { PamMonitoringPanel } from './components/PamMonitoringPanel';
export { PamRecordingPanel } from './components/PamRecordingPanel';
export { PamPolicyPanel } from './components/PamPolicyPanel';
export { PamAlertPanel } from './components/PamAlertPanel';

// Pages
export { PamDashboard } from './pages/PamDashboard';
export { PamMonitoringPage } from './pages/PamMonitoringPage';
export { PamSessionPage } from './pages/PamSessionPage';
export { PamAccessPage } from './pages/PamAccessPage';
export { PamRecordingPage } from './pages/PamRecordingPage';
export { PamRequestPage } from './pages/PamRequestPage';
export { PamPolicyPage } from './pages/PamPolicyPage';
export { PamAlertPage } from './pages/PamAlertPage';

// Hooks
export {
  usePamDashboard,
  useApproveRequest,
  useRejectRequest,
  useTerminateSession,
  useAcknowledgeAlert,
  useVaultAccounts,
  useCheckoutVaultAccount,
} from './hooks/usePamAnalytics';

// Types
export type * from './types/pam.types';
