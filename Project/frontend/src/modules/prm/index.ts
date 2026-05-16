// Components
export { PrmFeedbackPanel } from './components/PrmFeedbackPanel';
export { PrmComplaintPanel } from './components/PrmComplaintPanel';
export { PrmServiceQualityPanel } from './components/PrmServiceQualityPanel';

// Pages
export { PrmDashboard } from './pages/PrmDashboard';

// Hooks
export {
  usePrmDashboard,
  useEscalateComplaint,
  useResolveComplaint,
  useSendPatientFollowup,
} from './hooks/usePrmAnalytics';

// Types
export type * from './types/prm.types';
