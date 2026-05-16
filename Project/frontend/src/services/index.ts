export { default as api, apiGet, apiPost, apiPut, apiPatch, apiDelete, configureApiClient } from './api';
export * from './auth.service';
export { eventService } from './events.service';
export { gatewayApi, SERVICE_REGISTRY } from './gateway';
export type {
  ServiceHealthStatus,
  SystemHealthSummary,
  DashboardSummary,
  DashboardStat,
  ActivityEvent,
  SystemAlert,
  ServiceRegistryEntry,
} from './gateway';
