// Components
export { SurgeonCasePanel } from './components/SurgeonCasePanel';
export { SurgeonPreOpPanel } from './components/SurgeonPreOpPanel';
export { SurgeonActiveSurgeryPanel } from './components/SurgeonActiveSurgeryPanel';
export { SurgeonVitalsPanel } from './components/SurgeonVitalsPanel';
export { SurgeonNotesPanel } from './components/SurgeonNotesPanel';
export { SurgeonAlertPanel } from './components/SurgeonAlertPanel';

// Pages
export { SurgeonDashboard } from './pages/SurgeonDashboard';

// Hooks
export {
  useSurgeonDashboard,
  useAdvanceSurgicalStep,
  useSignPostOpNote,
  useLogComplication,
} from './hooks/useSurgeonAnalytics';

// Types
export type * from './types/surgeon.types';
