// Components
export { PatientQueuePanel } from './components/PatientQueuePanel';
export { ConsultationWorkspace } from './components/ConsultationWorkspace';
export { NotesPanel } from './components/NotesPanel';

// Pages
export { TelemedicineDashboard } from './pages/TelemedicineDashboard';

// Hooks
export { useTelemedicineDashboard, useStartConsultation, useEndConsultation, useSendPrescription } from './hooks/useTelemedicineAnalytics';

// Types
export type * from './types/telemedicine.types';
