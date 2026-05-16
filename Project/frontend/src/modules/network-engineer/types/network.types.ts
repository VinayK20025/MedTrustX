/**
 * MedTrustX — Network Engineer (Zero Trust & Micro-segmentation) Types
 */

export interface NetworkKPI {
  id: string;
  title: string;
  value: string | number;
  format?: 'number' | 'percentage' | 'text' | 'time' | 'data';
  status: 'normal' | 'warning' | 'critical' | 'success';
  trend?: number;
  trendDirection?: 'up' | 'down' | 'neutral';
  actionLabel?: string;
  actionUrl?: string;
}

export interface NetworkVPC {
  id: string;
  name: string;
  region: string;
  cidr: string;
  status: 'Active' | 'Provisioning' | 'Degraded';
  subnets: number;
}

export interface NetworkSubnet {
  id: string;
  vpcId: string;
  name: string;
  cidr: string;
  accessLevel: 'Public' | 'Private' | 'Isolated';
  status: 'Active' | 'Down';
}

export interface MicroSegmentationPolicy {
  id: string;
  workloadName: string;
  namespace: string;
  policyStatus: 'Enforced' | 'Simulation' | 'Violation';
  ingressRules: number;
  egressRules: number;
}

export interface ZeroTrustIdentity {
  id: string;
  entityName: string;
  entityType: 'User' | 'ServiceAccount' | 'Device';
  accessLevel: 'Allowed' | 'MFA Required' | 'Blocked' | 'Pending Verification';
  lastVerified: string;
}

export interface TrafficFlowLog {
  id: string;
  sourceIp: string;
  destinationIp: string;
  port: number;
  protocol: 'TCP' | 'UDP' | 'ICMP';
  action: 'ACCEPT' | 'REJECT' | 'DROP';
  timestamp: string;
  bytesTransferred: number;
}

export interface NetworkAlert {
  id: string;
  vpcId?: string;
  type: 'Unauthorized Access' | 'Policy Violation' | 'DDoS Signature' | 'High Latency';
  severity: 'warning' | 'critical';
  timestamp: string;
  status: 'Active' | 'Acknowledged' | 'Resolved';
  message: string;
}

export interface NetworkDashboardData {
  kpis: NetworkKPI[];
  vpcs: NetworkVPC[];
  subnets: NetworkSubnet[];
  segmentation: MicroSegmentationPolicy[];
  zeroTrust: ZeroTrustIdentity[];
  traffic: TrafficFlowLog[];
  alerts: NetworkAlert[];
}
