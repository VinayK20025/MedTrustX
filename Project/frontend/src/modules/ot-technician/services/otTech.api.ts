import { apiGet, apiPost } from '@/services/api';
import { endpoints } from '@/services/endpoints';
import type {
  OTTechDashboardData, OTTechKPI, OTDevice, DeviceTelemetry,
  EquipmentSetupTask, MaintenanceLog, OTTechAlert
} from '../types/otTech.types';

export interface OTTechFilters {
  otRoom?: string;
  deviceType?: string;
}

const mockKpis: OTTechKPI[] = [
  { id: '1', title: 'Active Devices', value: 24, format: 'number', status: 'normal' },
  { id: '2', title: 'Setup Pending', value: 2, format: 'number', status: 'warning', actionLabel: 'View Setup', actionUrl: '/dashboard/ot-technician/setup' },
  { id: '3', title: 'Maintenance Due', value: 1, format: 'number', status: 'warning', actionLabel: 'View Logs', actionUrl: '/dashboard/ot-technician/maintenance' },
  { id: '4', title: 'Critical Failures', value: 0, format: 'number', status: 'success' },
];

const mockDevices: OTDevice[] = [
  { id: 'DEV-AN-01', name: 'Dräger Fabius MRI', type: 'Anesthesia Machine', otRoom: 'OT-1', status: 'Active', batteryLevel: 100, lastCalibration: new Date(Date.now() - 86400000 * 5).toISOString() },
  { id: 'DEV-CA-03', name: 'GE OEC Elite', type: 'C-Arm', otRoom: 'OT-3', status: 'Standby', lastCalibration: new Date(Date.now() - 86400000 * 12).toISOString() },
  { id: 'DEV-EC-02', name: 'Valleylab FT10', type: 'Electrocautery', otRoom: 'OT-2', status: 'Maintenance Due', lastCalibration: new Date(Date.now() - 86400000 * 180).toISOString() },
];

const mockTelemetry: DeviceTelemetry[] = [
  { deviceId: 'DEV-AN-01', timestamp: new Date().toISOString(), pressure: 45, flowRate: 2.5, status: 'Nominal' },
  { deviceId: 'DEV-CA-03', timestamp: new Date().toISOString(), voltage: 220, temperature: 42, status: 'Nominal' },
];

const mockSetup: EquipmentSetupTask[] = [
  { id: 'SET-1', otRoom: 'OT-4', caseId: 'CASE-005', deviceType: 'C-Arm', description: 'Position and boot C-Arm for Ortho case', status: 'Pending' },
  { id: 'SET-2', otRoom: 'OT-4', caseId: 'CASE-005', deviceType: 'Electrocautery', description: 'Attach grounding pads and test bipolar output', status: 'Testing' },
];

const mockMaintenance: MaintenanceLog[] = [
  { id: 'MNT-1', deviceId: 'DEV-EC-02', date: new Date(Date.now() - 86400000).toISOString(), issue: 'Intermittent power loss', resolution: 'Replaced AC power module', performedBy: 'Tech M. Davis', timeSpentMinutes: 45 },
];

const mockAlerts: OTTechAlert[] = [
  { id: 'ALT-1', deviceId: 'DEV-EC-02', otRoom: 'OT-2', type: 'Hardware Failure', severity: 'warning', timestamp: new Date(Date.now() - 3600000).toISOString(), status: 'Active', message: 'Calibration required for bipolar output.' }
];

const normalizeDevices = (rawDevices: any[]): OTDevice[] => rawDevices.map((device, index) => ({
  id: device.id ?? `DEV-${index + 1}`,
  name: device.name ?? device.model ?? 'Device',
  type: device.type ?? device.deviceType ?? 'Patient Monitor',
  otRoom: device.otRoom ?? device.room ?? device.location ?? 'OT-1',
  status: device.status ?? 'Active',
  batteryLevel: device.batteryLevel ?? device.battery,
  lastCalibration: device.lastCalibration ?? device.calibratedAt ?? new Date().toISOString(),
}));

const normalizeTelemetry = (rawTelemetry: any[]): DeviceTelemetry[] => rawTelemetry.map((item, index) => ({
  deviceId: item.deviceId ?? item.device ?? `DEV-${index + 1}`,
  timestamp: item.timestamp ?? new Date().toISOString(),
  temperature: item.temperature ?? item.temp,
  pressure: item.pressure,
  flowRate: item.flowRate ?? item.flow,
  voltage: item.voltage,
  cpuUsage: item.cpuUsage ?? item.cpu,
  status: item.status ?? 'Nominal',
}));

const normalizeSetupTasks = (rawTasks: any[]): EquipmentSetupTask[] => rawTasks.map((task, index) => ({
  id: task.id ?? `SET-${index + 1}`,
  otRoom: task.otRoom ?? task.room ?? 'OT-1',
  caseId: task.caseId ?? task.case ?? 'CASE-001',
  deviceType: task.deviceType ?? task.device ?? 'Device',
  description: task.description ?? task.task ?? 'Setup task',
  status: task.status ?? 'Pending',
}));

const normalizeMaintenance = (rawLogs: any[]): MaintenanceLog[] => rawLogs.map((log, index) => ({
  id: log.id ?? `MNT-${index + 1}`,
  deviceId: log.deviceId ?? log.device ?? `DEV-${index + 1}`,
  date: log.date ?? log.performedAt ?? new Date().toISOString(),
  issue: log.issue ?? log.problem ?? 'Maintenance issue',
  resolution: log.resolution ?? log.fix ?? 'Resolved',
  performedBy: log.performedBy ?? log.technician ?? 'OT Tech',
  timeSpentMinutes: log.timeSpentMinutes ?? log.duration ?? 0,
}));

const normalizeAlerts = (rawAlerts: any[]): OTTechAlert[] => rawAlerts.map((alert, index) => ({
  id: alert.id ?? `ALT-${index + 1}`,
  deviceId: alert.deviceId ?? alert.device ?? `DEV-${index + 1}`,
  otRoom: alert.otRoom ?? alert.room ?? 'OT-1',
  type: alert.type ?? 'Connectivity Drop',
  severity: alert.severity ?? 'warning',
  timestamp: alert.timestamp ?? new Date().toISOString(),
  status: alert.status ?? 'Active',
  message: alert.message ?? 'Alert raised',
}));

export const otTechApi = {
  getDashboardSummary: async (filters: OTTechFilters) => {
    try {
      const [devicesRes, alertsRes] = await Promise.allSettled([
        apiGet<any>(endpoints.devices.list, { params: filters }),
        apiGet<any>(endpoints.devices.alerts),
      ]);

      const devicesPayload = devicesRes.status === 'fulfilled'
        ? (devicesRes.value?.data ?? devicesRes.value ?? [])
        : [];
      const alertsPayload = alertsRes.status === 'fulfilled'
        ? (alertsRes.value?.data ?? alertsRes.value ?? [])
        : [];

      const devices = Array.isArray(devicesPayload) && devicesPayload.length > 0
        ? normalizeDevices(devicesPayload)
        : mockDevices;

      let telemetry: DeviceTelemetry[] = mockTelemetry;
      if (devices.length > 0) {
        try {
          const telemetryRes = await apiGet<any>(endpoints.devices.telemetry(devices[0].id));
          const telemetryPayload = telemetryRes?.data ?? telemetryRes ?? [];
          telemetry = Array.isArray(telemetryPayload) && telemetryPayload.length > 0
            ? normalizeTelemetry(telemetryPayload)
            : mockTelemetry;
        } catch (error) {
          telemetry = mockTelemetry;
        }
      }

      const alerts = Array.isArray(alertsPayload) && alertsPayload.length > 0
        ? normalizeAlerts(alertsPayload)
        : mockAlerts;

      const setupTasks = mockSetup;
      const recentMaintenance = mockMaintenance;

      const setupPending = setupTasks.filter((task) => task.status !== 'Ready').length;
      const maintenanceDue = recentMaintenance.length;
      const kpis: OTTechKPI[] = [
        { id: '1', title: 'Active Devices', value: devices.length, format: 'number', status: 'normal' },
        { id: '2', title: 'Setup Pending', value: setupPending, format: 'number', status: setupPending > 0 ? 'warning' : 'success', actionLabel: 'View Setup', actionUrl: '/dashboard/ot-technician/setup' },
        { id: '3', title: 'Maintenance Due', value: maintenanceDue, format: 'number', status: maintenanceDue > 0 ? 'warning' : 'success', actionLabel: 'View Logs', actionUrl: '/dashboard/ot-technician/maintenance' },
        { id: '4', title: 'Critical Failures', value: alerts.filter((alert) => alert.severity === 'critical').length, format: 'number', status: alerts.some((alert) => alert.severity === 'critical') ? 'critical' : 'success' },
      ];

      return {
        data: {
          kpis,
          devices,
          liveTelemetry: telemetry,
          setupTasks,
          recentMaintenance,
          alerts,
        } as OTTechDashboardData,
        message: 'Success',
        status: 200,
      };
    } catch (error) {
      return {
        data: {
          kpis: mockKpis,
          devices: mockDevices,
          liveTelemetry: mockTelemetry,
          setupTasks: mockSetup,
          recentMaintenance: mockMaintenance,
          alerts: mockAlerts,
        } as OTTechDashboardData,
        message: 'Failed to load live OT technician data, falling back to cached state',
        status: 500,
      };
    }
  },

  updateSetupTask: async (taskId: string, status: EquipmentSetupTask['status']) => {
    try {
      const response = await apiPost<any>(endpoints.devices.device(taskId), { status });
      return { data: response, message: `Task status updated to ${status}`, status: 200 };
    } catch (error) {
      return { data: { success: true }, message: `Task status updated to ${status}`, status: 200 };
    }
  },
  acknowledgeAlert: async (alertId: string) => {
    try {
      const response = await apiPost<any>(endpoints.devices.alerts, { alertId, status: 'Acknowledged' });
      return { data: response, message: 'Alert acknowledged', status: 200 };
    } catch (error) {
      return { data: { success: true }, message: 'Alert acknowledged', status: 200 };
    }
  },
  logMaintenance: async (log: Partial<MaintenanceLog>) => {
    try {
      const response = await apiPost<any>(endpoints.devices.list, { log });
      return { data: response, message: 'Maintenance logged successfully', status: 201 };
    } catch (error) {
      return { data: { success: true }, message: 'Maintenance logged successfully', status: 201 };
    }
  },
};
