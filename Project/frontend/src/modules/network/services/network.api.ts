import type {
  NetworkDashboardData, NetworkKPI, NetworkDevice, TopologyLink, NetworkIncident, NetworkSecurityThreat
} from '../types/network.types';

export interface NetworkFilters { location?: string; status?: string; }

const mockKpis: NetworkKPI[] = [
  { id: '1', title: 'Network Uptime', value: '99.99%', format: 'text', status: 'success' },
  { id: '2', title: 'Avg Latency', value: '12ms', format: 'text', status: 'normal' },
  { id: '3', title: 'Active Alerts', value: 2, format: 'number', status: 'warning' },
  { id: '4', title: 'Security Blocks', value: 18, format: 'number', status: 'normal' },
];

const mockDevices: NetworkDevice[] = [
  { id: 'DEV-R1', name: 'Core Router A', type: 'Router', status: 'Online', location: 'Server Room', uptime: 99.9, load: 45, latency: 2 },
  { id: 'DEV-SW1', name: 'ICU Switch Main', type: 'Switch', status: 'Degraded', location: 'ICU Block B', uptime: 98.2, load: 88, latency: 45 },
  { id: 'DEV-FW1', name: 'Edge Firewall', type: 'Firewall', status: 'Online', location: 'Server Room', uptime: 100, load: 30, latency: 1 },
  { id: 'DEV-AP1', name: 'ER WiFi AP-1', type: 'WiFi AP', status: 'Offline', location: 'ER Triage', uptime: 0, load: 0, latency: 0 },
];

const mockLinks: TopologyLink[] = [
  { source: 'DEV-R1', target: 'DEV-FW1', status: 'OK' },
  { source: 'DEV-R1', target: 'DEV-SW1', status: 'Warning' },
  { source: 'DEV-SW1', target: 'DEV-AP1', status: 'Critical' },
];

const mockIncidents: NetworkIncident[] = [
  { id: 'NET-101', title: 'ICU Switch High Latency', description: 'Switch load exceeded 85%, causing packet drops.', deviceAffected: 'DEV-SW1', severity: 'High', status: 'Investigating', reportedAt: new Date(Date.now() - 900000).toISOString() },
  { id: 'NET-102', title: 'ER WiFi AP Down', description: 'Access Point unresponsive to pings.', deviceAffected: 'DEV-AP1', severity: 'Medium', status: 'Open', reportedAt: new Date(Date.now() - 1800000).toISOString() },
];

const mockThreats: NetworkSecurityThreat[] = [
  { id: 'THR-001', timestamp: new Date(Date.now() - 150000).toISOString(), type: 'Unauthorized Access', sourceIp: '192.168.4.55', targetSystem: 'SYS-EMR', status: 'Active' },
  { id: 'THR-002', timestamp: new Date(Date.now() - 3600000).toISOString(), type: 'Port Scan', sourceIp: '45.33.22.11', targetSystem: 'DEV-FW1', status: 'Blocked' },
];

export const networkApi = {
  getDashboardSummary: async (filters: NetworkFilters) => ({
    data: { kpis: mockKpis, devices: mockDevices, links: mockLinks, incidents: mockIncidents, threats: mockThreats } as NetworkDashboardData,
    message: 'Success', status: 200,
  }),
  restartDevice: async (deviceId: string) => ({ data: { success: true }, message: 'Device reboot initiated', status: 200 }),
  blockThreat: async (threatId: string) => ({ data: { success: true }, message: 'Threat IP blocked at Edge Firewall', status: 200 }),
  resolveIncident: async (incidentId: string) => ({ data: { success: true }, message: 'Incident resolved', status: 200 }),
};
