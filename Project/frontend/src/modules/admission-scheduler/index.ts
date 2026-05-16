// Components
export { SchedulerCalendarView } from './components/SchedulerCalendarView';
export { AdmissionWizardPanel } from './components/AdmissionWizardPanel';
export { AdmissionSidePanel } from './components/AdmissionSidePanel';

// Pages
export { AdmissionSchedulerDashboard } from './pages/AdmissionSchedulerDashboard';

// Hooks
export {
  useAdmissionSchedulerDashboard,
  useBookSlot,
  useCancelSlot,
  usePromoteWaitlist,
  useSubmitAdmission,
  useAllocateBed,
} from './hooks/useAdmissionSchedulerAnalytics';

// Types
export type * from './types/admissionScheduler.types';
