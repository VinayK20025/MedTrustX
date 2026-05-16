export { useAuth } from './useAuth';
export { useEventSubscription, useEventInvalidation, useConnectionState, useEventBuffer } from './useEvents';
export { useDebounce, useDebouncedCallback } from './useDebounce';
export { useMediaQuery, useIsMobile, useIsTablet, useIsDesktop, useIsLargeDesktop } from './useMediaQuery';
export { useRoleCheck, useAnyRoleCheck, usePermissionCheck, usePermissionsCheck } from './usePermission';
export {
  useSystemHealth,
  useServiceHealth,
  useDashboardSummary,
  usePatientStats,
  useAppointmentStats,
  useBedOccupancy,
  useRevenueStats,
  useERStats,
  useDeviceStats,
  useZTAStats,
  useRecentActivity,
  useLiveActivity,
  useSystemAlerts,
  useAcknowledgeAlert,
  useDashboardEventSync,
  DASHBOARD_KEYS,
} from './useDashboard';
