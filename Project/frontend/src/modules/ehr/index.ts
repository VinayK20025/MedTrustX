// Components
export { EhrPatientPanel } from './components/EhrPatientPanel';
export { EhrWorkspace } from './components/EhrWorkspace';
export { EhrValidationPanel } from './components/EhrValidationPanel';

// Pages
export { EhrDashboard } from './pages/EhrDashboard';
export { EhrMpiPage } from './pages/EhrMpiPage';

// Hooks
export { useEhrDashboard, useEhrPatientData, useSaveEhrRecord, useValidateEhrRecord, useMpiRecords, useResolveMpiRecord } from './hooks/useEhrAnalytics';

// Types
export type * from './types/ehr.types';
