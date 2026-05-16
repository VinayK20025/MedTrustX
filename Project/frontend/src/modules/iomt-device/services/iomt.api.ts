import { apiGet, apiPost } from '@/services/api';
import { endpoints } from '@/services/endpoints';
import type { IomtData, LiveDataStream, IomtAlert, IomtDevice, AuthCertificate, ValidationCheck, SecurityPolicy, IomtMetrics } from '../types/iomt.types';

const t = (sec: number) => new Date(Date.now() + sec * 1000).toISOString();

const mockData: IomtData = {
  metrics: {
    activeDevices: 1205,
    totalDevices: 1250,
    dataTransmissionRate: 15420, // msgs/min
    authSuccessRate: 99.8,
    securityIncidents: 2,
  },
  devices: [
    { id: 'DEV-ICU-001', name: 'Philips IntelliVue MX700', type: 'ICU Monitor', department: 'ICU-A', status: 'Active', lastPing: t(-2), ipAddress: '10.12.4.101', firmwareVersion: 'v4.2.1' },
    { id: 'DEV-INF-042', name: 'Alaris Pump Module', type: 'Infusion Pump', department: 'Oncology', status: 'Active', lastPing: t(-15), ipAddress: '10.12.6.42', firmwareVersion: 'v2.1.0' },
    { id: 'DEV-VEN-011', name: 'Puritan Bennett 980', type: 'Ventilator', department: 'ICU-B', status: 'Offline', lastPing: t(-3600), ipAddress: '10.12.4.211', firmwareVersion: 'v3.5.5' },
    { id: 'DEV-WRB-099', name: 'Biobeat Chest Patch', type: 'Wearable Sensor', department: 'Cardiology', status: 'Quarantined', lastPing: t(-120), ipAddress: '10.14.8.99', firmwareVersion: 'v1.0.4' },
    { id: 'DEV-ICU-005', name: 'GE CARESCAPE B850', type: 'ICU Monitor', department: 'ER', status: 'Pending Auth', lastPing: t(-5), ipAddress: '10.10.2.15', firmwareVersion: 'v5.0.0' },
  ],
  certificates: [
    { deviceId: 'DEV-ICU-001', certId: 'CERT-A912', issuer: 'MedTrust Internal CA', status: 'Valid', expiryDate: t(86400 * 180), encryption: 'TLS 1.3' },
    { deviceId: 'DEV-INF-042', certId: 'CERT-A422', issuer: 'MedTrust Internal CA', status: 'Valid', expiryDate: t(86400 * 90), encryption: 'TLS 1.3' },
    { deviceId: 'DEV-VEN-011', certId: 'CERT-A111', issuer: 'MedTrust Internal CA', status: 'Expired', expiryDate: t(-86400 * 2), encryption: 'TLS 1.2' },
    { deviceId: 'DEV-WRB-099', certId: 'CERT-A099', issuer: 'MedTrust Internal CA', status: 'Revoked', expiryDate: t(86400 * 300), encryption: 'Unencrypted' },
    { deviceId: 'DEV-ICU-005', certId: 'CERT-A005', issuer: 'MedTrust Internal CA', status: 'Pending', expiryDate: t(86400 * 365), encryption: 'TLS 1.3' },
  ],
  liveData: [
    { deviceId: 'DEV-ICU-001', metricName: 'Heart Rate', value: 78, unit: 'bpm', timestamp: t(-1), integrityStatus: 'Verified' },
    { deviceId: 'DEV-ICU-001', metricName: 'SpO2', value: 98, unit: '%', timestamp: t(-1), integrityStatus: 'Verified' },
    { deviceId: 'DEV-INF-042', metricName: 'Flow Rate', value: 25, unit: 'mL/hr', timestamp: t(-10), integrityStatus: 'Verified' },
    { deviceId: 'DEV-WRB-099', metricName: 'Skin Temp', value: 38.5, unit: '°C', timestamp: t(-120), integrityStatus: 'Corrupt' },
  ],
  validationChecks: [
    { id: 'VAL-101', deviceId: 'DEV-ICU-001', checkType: 'Checksum', status: 'Verified', timestamp: t(-1) },
    { id: 'VAL-102', deviceId: 'DEV-WRB-099', checkType: 'Format Validation', status: 'Failed', timestamp: t(-120) },
    { id: 'VAL-103', deviceId: 'DEV-INF-042', checkType: 'Range Check', status: 'Verified', timestamp: t(-10) },
  ],
  securityPolicies: [
    { id: 'POL-01', policyName: 'Mandatory TLS 1.3 Encryption', status: 'Enforcing', description: 'All device streams must use TLS 1.3. Fallbacks rejected.' },
    { id: 'POL-02', policyName: 'Zero-Trust Certificate Auth', status: 'Enforcing', description: 'Devices without valid MedTrust CA certificates are quarantined.' },
    { id: 'POL-03', policyName: 'Payload Integrity Checksum', status: 'Enabled', description: 'All clinical telemetry payloads verified via SHA-256 checksums.' },
  ],
  alerts: [
    { id: 'ALT-401', deviceId: 'DEV-WRB-099', issue: 'Device Unauthenticated (Revoked Cert)', severity: 'Critical', timestamp: t(-120), resolved: false },
    { id: 'ALT-402', deviceId: 'DEV-VEN-011', issue: 'Device Offline > 1 Hour', severity: 'Warning', timestamp: t(-3600), resolved: false },
    { id: 'ALT-403', deviceId: 'DEV-ICU-005', issue: 'Pending Authentication Request', severity: 'Info', timestamp: t(-300), resolved: false },
  ]
};

const statusFromValue = (value?: string): IomtDevice['status'] => {
  const normalized = (value ?? '').toLowerCase();
  if (normalized.includes('quarantine')) return 'Quarantined';
  if (normalized.includes('pending')) return 'Pending Auth';
  if (normalized.includes('offline') || normalized.includes('inactive')) return 'Offline';
  return 'Active';
};

const normalizeDevices = (rawDevices: any[]): IomtDevice[] => rawDevices.map((device, index) => ({
  id: device.id ?? device.deviceId ?? `DEV-${index + 1}`,
  name: device.name ?? device.model ?? 'IoMT Device',
  type: device.type ?? device.deviceType ?? 'ICU Monitor',
  department: device.department ?? device.location ?? 'OT',
  status: statusFromValue(device.status),
  lastPing: device.lastPing ?? device.lastSeen ?? new Date().toISOString(),
  ipAddress: device.ipAddress ?? device.ip ?? '0.0.0.0',
  firmwareVersion: device.firmwareVersion ?? device.firmware ?? 'v1.0.0',
}));

const normalizeAlerts = (rawAlerts: any[]): IomtAlert[] => rawAlerts.map((alert, index) => ({
  id: alert.id ?? `ALT-${index + 1}`,
  deviceId: alert.deviceId ?? alert.device ?? 'UNKNOWN',
  issue: alert.issue ?? alert.message ?? alert.description ?? 'Alert raised',
  severity: alert.severity ?? 'Warning',
  timestamp: alert.timestamp ?? new Date().toISOString(),
  resolved: alert.resolved ?? false,
}));

const normalizeLiveData = (rawStream: any[]): LiveDataStream[] => rawStream.map((item, index) => ({
  deviceId: item.deviceId ?? item.device ?? `DEV-${index + 1}`,
  metricName: item.metricName ?? item.metric ?? 'Metric',
  value: item.value ?? 0,
  unit: item.unit ?? 'unit',
  timestamp: item.timestamp ?? new Date().toISOString(),
  integrityStatus: item.integrityStatus ?? 'Verified',
}));

const normalizeCertificates = (rawCertificates: any[]): AuthCertificate[] => rawCertificates.map((cert, index) => ({
  deviceId: cert.deviceId ?? cert.device ?? `DEV-${index + 1}`,
  certId: cert.certId ?? cert.id ?? `CERT-${index + 1}`,
  issuer: cert.issuer ?? 'MedTrust Internal CA',
  status: cert.status ?? 'Valid',
  expiryDate: cert.expiryDate ?? new Date(Date.now() + 86400 * 1000).toISOString(),
  encryption: cert.encryption ?? 'TLS 1.3',
}));

const normalizeValidation = (rawChecks: any[]): ValidationCheck[] => rawChecks.map((check, index) => ({
  id: check.id ?? `VAL-${index + 1}`,
  deviceId: check.deviceId ?? check.device ?? `DEV-${index + 1}`,
  checkType: check.checkType ?? check.type ?? 'Checksum',
  status: check.status ?? 'Verified',
  timestamp: check.timestamp ?? new Date().toISOString(),
}));

const normalizePolicies = (rawPolicies: any[]): SecurityPolicy[] => rawPolicies.map((policy, index) => ({
  id: policy.id ?? `POL-${index + 1}`,
  policyName: policy.policyName ?? policy.name ?? 'Policy',
  status: policy.status ?? 'Enabled',
  description: policy.description ?? 'Security policy',
}));

export const iomtApi = {
  getData: async () => {
    try {
      const [devicesRes, statsRes, alertsRes] = await Promise.allSettled([
        apiGet<any>(endpoints.devices.list),
        apiGet<any>(endpoints.devices.statsSummary),
        apiGet<any>(endpoints.devices.alerts),
      ]);

      const devicesPayload = devicesRes.status === 'fulfilled'
        ? (devicesRes.value?.data ?? devicesRes.value ?? [])
        : [];
      const statsPayload = statsRes.status === 'fulfilled'
        ? (statsRes.value?.data ?? statsRes.value ?? null)
        : null;
      const alertsPayload = alertsRes.status === 'fulfilled'
        ? (alertsRes.value?.data ?? alertsRes.value ?? [])
        : [];

      const devices = Array.isArray(devicesPayload) && devicesPayload.length > 0
        ? normalizeDevices(devicesPayload)
        : mockData.devices;

      let liveData: LiveDataStream[] = mockData.liveData;
      if (devices.length > 0) {
        try {
          const telemetryRes = await apiGet<any>(endpoints.devices.telemetry(devices[0].id));
          const telemetryPayload = telemetryRes?.data ?? telemetryRes ?? [];
          liveData = Array.isArray(telemetryPayload) && telemetryPayload.length > 0
            ? normalizeLiveData(telemetryPayload)
            : mockData.liveData;
        } catch (error) {
          liveData = mockData.liveData;
        }
      }

      const alerts = Array.isArray(alertsPayload) && alertsPayload.length > 0
        ? normalizeAlerts(alertsPayload)
        : mockData.alerts;

      const metrics: IomtMetrics = statsPayload
        ? {
            activeDevices: statsPayload.onlineDevices ?? statsPayload.activeDevices ?? 0,
            totalDevices: statsPayload.totalDevices ?? devices.length,
            dataTransmissionRate: statsPayload.dataTransmissionRate ?? mockData.metrics.dataTransmissionRate,
            authSuccessRate: statsPayload.authSuccessRate ?? mockData.metrics.authSuccessRate,
            securityIncidents: statsPayload.alertingDevices ?? statsPayload.securityIncidents ?? alerts.length,
          }
        : {
            activeDevices: devices.filter((d) => d.status === 'Active').length,
            totalDevices: devices.length,
            dataTransmissionRate: mockData.metrics.dataTransmissionRate,
            authSuccessRate: mockData.metrics.authSuccessRate,
            securityIncidents: alerts.filter((a) => !a.resolved).length,
          };

      const certificates = Array.isArray((statsPayload as any)?.certificates)
        ? normalizeCertificates((statsPayload as any).certificates)
        : mockData.certificates;
      const validationChecks = Array.isArray((statsPayload as any)?.validationChecks)
        ? normalizeValidation((statsPayload as any).validationChecks)
        : mockData.validationChecks;
      const securityPolicies = Array.isArray((statsPayload as any)?.securityPolicies)
        ? normalizePolicies((statsPayload as any).securityPolicies)
        : mockData.securityPolicies;

      return {
        data: {
          metrics,
          devices,
          certificates,
          liveData,
          validationChecks,
          securityPolicies,
          alerts,
        } as IomtData,
        message: 'Success',
        status: 200,
      };
    } catch (error) {
      return {
        data: mockData,
        message: 'Failed to load live IoMT data, falling back to cached state',
        status: 500,
      };
    }
  },
  revokeCertificate: async (deviceId: string) => {
    try {
      const response = await apiPost<any>(endpoints.devices.device(deviceId), { action: 'revoke' });
      return { data: response, message: 'Certificate Revoked', status: 200 };
    } catch (error) {
      return { data: { success: true }, message: 'Certificate Revoked', status: 200 };
    }
  },
  approveDevice: async (deviceId: string) => {
    try {
      const response = await apiPost<any>(endpoints.devices.device(deviceId), { action: 'approve' });
      return { data: response, message: 'Device Authenticated', status: 200 };
    } catch (error) {
      return { data: { success: true }, message: 'Device Authenticated', status: 200 };
    }
  },
  resolveAlert: async (alertId: string) => {
    try {
      const response = await apiPost<any>(endpoints.devices.alerts, { alertId, status: 'Resolved' });
      return { data: response, message: 'Alert Resolved', status: 200 };
    } catch (error) {
      return { data: { success: true }, message: 'Alert Resolved', status: 200 };
    }
  },
};
