// Components
export { CounselorPatientList } from './components/CounselorPatientList';
export { CounselorSessionPanel } from './components/CounselorSessionPanel';
export { CounselorCostPanel } from './components/CounselorCostPanel';

// Pages
export { PatientCounselorDashboard } from './pages/PatientCounselorDashboard';

// Hooks
export {
  usePatientCounselorDashboard,
  useMarkPointDiscussed,
  useSaveSessionNotes,
  useCompleteCounseling,
} from './hooks/usePatientCounselorAnalytics';

// Types
export type * from './types/patientCounselor.types';
