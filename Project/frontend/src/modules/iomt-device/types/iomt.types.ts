/**
 * MedTrustX — IoMT Device Platform Types
 * Security-first communication, zero-trust architecture, real-time data streaming.
 */

export type DeviceStatus = 'Active' | 'Offline' | 'Quarantined' | 'Pending Auth';
export type DeviceType = 'ICU Monitor' | 'Infusion Pump' | 'Ventilator' | 'Wearable Sensor' | 'Pacemaker';
export type AuthStatus = 'Valid' | 'Expired' | 'Revoked' | 'Pending';
export type AlertSeverity = 'Critical' | 'Warning' | 'Info';

export interface IomtDevice {
  id: string;
  name: string;
  type: DeviceType;
  department: string;
  status: DeviceStatus;
  lastPing: string;
  ipAddress: string;
  firmwareVersion: string;
}

export interface AuthCertificate {
  deviceId: string;
  certId: string;
  issuer: string;
  status: AuthStatus;
  expiryDate: string;
  encryption: 'TLS 1.3' | 'TLS 1.2' | 'Unencrypted';
}

export interface LiveDataStream {
  deviceId: string;
  metricName: string;
  value: number;
  unit: string;
  timestamp: string;
  integrityStatus: 'Verified' | 'Corrupt' | 'Unverified';
}

export interface ValidationCheck {
  id: string;
  deviceId: string;
  checkType: 'Checksum' | 'Format Validation' | 'Range Check';
  status: 'Verified' | 'Failed';
  timestamp: string;
}

export interface SecurityPolicy {
  id: string;
  policyName: string;
  status: 'Enabled' | 'Disabled' | 'Enforcing';
  description: string;
}

export interface IomtAlert {
  id: string;
  deviceId: string;
  issue: string;
  severity: AlertSeverity;
  timestamp: string;
  resolved: boolean;
}

export interface IomtMetrics {
  activeDevices: number;
  totalDevices: number;
  dataTransmissionRate: number; // e.g., MB/s or msgs/min
  authSuccessRate: number; // percentage
  securityIncidents: number;
}

export interface IomtData {
  metrics: IomtMetrics;
  devices: IomtDevice[];
  certificates: AuthCertificate[];
  liveData: LiveDataStream[];
  validationChecks: ValidationCheck[];
  securityPolicies: SecurityPolicy[];
  alerts: IomtAlert[];
}
