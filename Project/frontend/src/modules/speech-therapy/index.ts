// Components
export { SpeechPatientPanel } from './components/SpeechPatientPanel';
export { SpeechSessionPanel } from './components/SpeechSessionPanel';
export { SpeechTherapyPanel } from './components/SpeechTherapyPanel';
export { SpeechProgressPanel } from './components/SpeechProgressPanel';
export { SpeechAssessmentPanel } from './components/SpeechAssessmentPanel';
export { SpeechEducationPanel } from './components/SpeechEducationPanel';

// Pages
export { SpeechDashboard } from './pages/SpeechDashboard';

// Hooks
export {
  useSpeechDashboard,
  useStartSpeechSession,
  useCompleteSpeechSession,
  useSubmitSpeechAssessment,
  useUpdateSpeechPlan,
} from './hooks/useSpeechAnalytics';

// Types
export type * from './types/speech.types';
