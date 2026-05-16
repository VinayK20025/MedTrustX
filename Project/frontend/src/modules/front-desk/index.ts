// Components
export { FrontDeskQueuePanel } from './components/FrontDeskQueuePanel';
export { FrontDeskRegistrationPanel } from './components/FrontDeskRegistrationPanel';
export { FrontDeskAppointmentPanel } from './components/FrontDeskAppointmentPanel';

// Pages
export { FrontDeskDashboard } from './pages/FrontDeskDashboard';

// Hooks
export {
  useFrontDeskDashboard,
  useRegisterPatient,
  useBookAppointment,
  useGenerateToken,
  useCallNextToken,
  useSkipToken,
} from './hooks/useFrontDeskAnalytics';

// Types
export type * from './types/frontDesk.types';
