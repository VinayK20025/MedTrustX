/**
 * MedTrustX — Network Administrator (Role 95) Types
 */

export interface NetworkKPI {
  id: string;
  title: string;
  value: string | number;
  format?: 'number' | 'text' | 'percentage';
  status: 'normal' | 'warning' | 'critical' | 'success';
}

export type DeviceStatus = 'Online' | 'Degraded' | 'Offline' | 'Maintenance';

export interface NetworkDevice {
  id: string;
  name: string;
  type: 'Router' | 'Switch' | 'Firewall' | 'WiFi AP';
  status: DeviceStatus;
  location: string;
  uptime: number; // percentage
  load: number; // percentage
  latency: number; // ms
}

export interface TopologyLink {
  source: string;
  target: string;
  status: 'OK' | 'Warning' | 'Critical';
}

export interface NetworkIncident {
  id: string;
  title: string;
  description: string;
  deviceAffected: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'Open' | 'Investigating' | 'Resolved';
  reportedAt: string;
}

export interface NetworkSecurityThreat {
  id: string;
  timestamp: string;
  type: 'DDoS' | 'Unauthorized Access' | 'Port Scan' | 'Malware Traffic';
  sourceIp: string;
  targetSystem: string;
  status: 'Blocked' | 'Active' | 'Investigating';
}

export interface NetworkDashboardData {
  kpis: NetworkKPI[];
  devices: NetworkDevice[];
  links: TopologyLink[];
  incidents: NetworkIncident[];
  threats: NetworkSecurityThreat[];
}
