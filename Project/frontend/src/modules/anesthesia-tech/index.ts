// Components
export { AnesthesiaDevicePanel } from './components/AnesthesiaDevicePanel';
export { AnesthesiaMonitoringPanel } from './components/AnesthesiaMonitoringPanel';
export { AnesthesiaSetupPanel } from './components/AnesthesiaSetupPanel';
export { AnesthesiaDrugPanel } from './components/AnesthesiaDrugPanel';
export { AnesthesiaAlertPanel } from './components/AnesthesiaAlertPanel';

// Pages
export { AnesthesiaTechDashboard } from './pages/AnesthesiaTechDashboard';

// Hooks
export {
  useAnesthesiaTechDashboard,
  useVerifySetupTask,
  usePrepareDrug,
  useAcknowledgeAlert,
} from './hooks/useAnesthesiaTechAnalytics';

// Types
export type * from './types/anesthesiaTech.types';
