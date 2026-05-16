/**
 * MedTrustX — Security Manager (Physical Security – Role 99) Types
 */

export interface SecurityKPI {
  id: string;
  title: string;
  value: string | number;
  format?: 'number' | 'text';
  status: 'normal' | 'warning' | 'critical' | 'success';
}

export type ZoneStatus = 'Secure' | 'Alert' | 'Crowd' | 'Lockdown';

export interface SecurityZone {
  id: string;
  name: string; // ICU, OT, ER, OPD
  status: ZoneStatus;
  guardCount: number;
  lastScanAt: string;
}

export interface CameraFeed {
  id: string;
  name: string;
  zone: string;
  status: 'Live' | 'Offline' | 'Alert';
  thumbnailColor: string; // CSS gradient for placeholder
}

export type IncidentType = 'Unauthorized Access' | 'Suspicious Activity' | 'Crowd Overload' | 'Medical Emergency' | 'Theft';
export type IncidentStatus = 'Detected' | 'Assigned' | 'Responding' | 'Resolved';

export interface SecurityIncident {
  id: string;
  type: IncidentType;
  location: string;
  status: IncidentStatus;
  severity: 'High' | 'Medium' | 'Low';
  reportedAt: string;
  assignedGuard?: string;
  description: string;
}

export interface GuardStatus {
  id: string;
  name: string;
  location: string;
  status: 'On Duty' | 'Responding' | 'Off Duty';
}

export interface SecurityDashboardData {
  kpis: SecurityKPI[];
  zones: SecurityZone[];
  cameras: CameraFeed[];
  incidents: SecurityIncident[];
  guards: GuardStatus[];
}
