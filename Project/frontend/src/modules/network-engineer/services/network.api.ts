import type {
  NetworkDashboardData, NetworkKPI, NetworkVPC, NetworkSubnet, MicroSegmentationPolicy,
  ZeroTrustIdentity, TrafficFlowLog, NetworkAlert
} from '../types/network.types';

export interface NetworkFilters {
  vpcId?: string;
}

const mockKpis: NetworkKPI[] = [
  { id: '1', title: 'Active VPCs', value: 3, format: 'number', status: 'success' },
  { id: '2', title: 'Network Egress', value: '1.2 TB', format: 'data', status: 'normal' },
  { id: '3', title: 'ZTNA Blocks', value: 142, format: 'number', status: 'warning' },
  { id: '4', title: 'Active Incidents', value: 1, format: 'number', status: 'critical', actionLabel: 'View Flow Logs', actionUrl: '/dashboard/network-engineer/traffic' },
];

const mockVpcs: NetworkVPC[] = [
  { id: 'VPC-PROD-01', name: 'clinical-core-vpc', region: 'us-east-1', cidr: '10.0.0.0/16', status: 'Active', subnets: 6 },
  { id: 'VPC-SEC-01', name: 'security-dmz-vpc', region: 'us-east-1', cidr: '172.16.0.0/16', status: 'Active', subnets: 2 },
];

const mockSubnets: NetworkSubnet[] = [
  { id: 'SUBNET-A', vpcId: 'VPC-PROD-01', name: 'ehr-db-isolated', cidr: '10.0.1.0/24', accessLevel: 'Isolated', status: 'Active' },
  { id: 'SUBNET-B', vpcId: 'VPC-PROD-01', name: 'api-gateway-public', cidr: '10.0.2.0/24', accessLevel: 'Public', status: 'Active' },
];

const mockSegmentation: MicroSegmentationPolicy[] = [
  { id: 'POL-1', workloadName: 'ehr-database', namespace: 'clinical-core', policyStatus: 'Enforced', ingressRules: 2, egressRules: 0 },
  { id: 'POL-2', workloadName: 'telemetry-ingestor', namespace: 'iot-devices', policyStatus: 'Simulation', ingressRules: 1, egressRules: 4 },
];

const mockZeroTrust: ZeroTrustIdentity[] = [
  { id: 'ID-101', entityName: 'Dr. Sarah Jenkins', entityType: 'User', accessLevel: 'Allowed', lastVerified: new Date(Date.now() - 300000).toISOString() },
  { id: 'ID-102', entityName: 'svc-billing-api', entityType: 'ServiceAccount', accessLevel: 'Blocked', lastVerified: new Date(Date.now() - 86400000).toISOString() },
  { id: 'ID-103', entityName: 'IPad-ICU-Bed4', entityType: 'Device', accessLevel: 'MFA Required', lastVerified: new Date(Date.now() - 3600000).toISOString() },
];

const mockTraffic: TrafficFlowLog[] = [
  { id: 'FLOW-1', sourceIp: '192.168.1.45', destinationIp: '10.0.1.15', port: 5432, protocol: 'TCP', action: 'REJECT', timestamp: new Date(Date.now() - 1000).toISOString(), bytesTransferred: 0 },
  { id: 'FLOW-2', sourceIp: '10.0.2.10', destinationIp: '10.0.1.15', port: 5432, protocol: 'TCP', action: 'ACCEPT', timestamp: new Date(Date.now() - 5000).toISOString(), bytesTransferred: 45000 },
];

const mockAlerts: NetworkAlert[] = [
  { id: 'ALT-1', vpcId: 'VPC-PROD-01', type: 'Unauthorized Access', severity: 'critical', timestamp: new Date(Date.now() - 1000).toISOString(), status: 'Active', message: 'Repeated PostgreSQL (port 5432) connection attempts from unauthorized subnet.' },
];

export const networkApi = {
  getDashboardSummary: async (filters: NetworkFilters) => ({
    data: {
      kpis: mockKpis,
      vpcs: mockVpcs,
      subnets: mockSubnets,
      segmentation: mockSegmentation,
      zeroTrust: mockZeroTrust,
      traffic: mockTraffic,
      alerts: mockAlerts,
    } as NetworkDashboardData,
    message: 'Success', status: 200,
  }),

  enforcePolicy: async (policyId: string) => ({ data: { success: true }, message: `Policy ${policyId} transitioned to Enforced`, status: 200 }),
  revokeIdentity: async (identityId: string) => ({ data: { success: true }, message: 'Identity access revoked immediately', status: 200 }),
  acknowledgeAlert: async (alertId: string) => ({ data: { success: true }, message: 'Alert acknowledged', status: 200 }),
};
