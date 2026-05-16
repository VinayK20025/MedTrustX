// Pages
export { WazuhDashboard } from './pages/WazuhDashboard';

// Hooks
export {
  useWazuhDashboard,
  useWazuhAlerts,
  useAcknowledgeAlert,
  useWazuhVulnerabilities,
  useWazuhFim,
  useWazuhSca,
  useWazuhAgents,
  useRestartAgent,
} from './hooks/useWazuhAnalytics';

// Types
export type * from './types/wazuh.types';
