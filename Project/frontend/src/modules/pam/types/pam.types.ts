/**
 * MedTrustX — PAM Operator Types
 * Privileged Access Management, JIT Elevation, and Session Control.
 */

export interface PAMKPI {
  id: string;
  title: string;
  value: string | number;
  format?: 'number' | 'percentage' | 'text';
  status: 'normal' | 'warning' | 'critical' | 'success';
  delta?: string;
  trend?: number;
  trendDirection?: 'up' | 'down' | 'neutral';
  actionLabel?: string;
  actionUrl?: string;
}

export interface PAMAccount {
  id: string;
  accountName: string;
  system: string;
  target?: string;
  protocol?: string;
  accessLevel: 'Root' | 'DBA' | 'SysAdmin' | 'NetworkAdmin' | 'CloudAdmin';
  owner: string;
  status: 'active' | 'vaulted' | 'locked' | 'in_use';
  lastUsed: string;
  riskScore: number;
}

export interface PAMRequest {
  id: string;
  requester: string;
  department: string;
  targetAccount: string;
  targetSystem: string;
  justification: string;
  duration: string;
  status: 'pending' | 'approved' | 'rejected' | 'active' | 'expired';
  requestedAt: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

export interface PAMSession {
  id: string;
  user: string;
  targetAccount: string;
  targetSystem: string;
  startTime: string;
  duration: string;
  status: 'active' | 'terminated' | 'paused';
  connectionType: 'SSH' | 'RDP' | 'DB' | 'Web';
  riskScore: number;
}

export interface PAMLiveActivity {
  id: string;
  sessionId: string;
  user: string;
  command: string;
  timestamp: string;
  riskLevel: 'info' | 'warning' | 'critical';
}

export interface PAMRecording {
  id: string;
  sessionId: string;
  user: string;
  targetSystem: string;
  duration: string;
  date: string;
  size: string;
  status: 'available' | 'archived';
  anomalyDetected: boolean;
}

export interface PAMPolicy {
  id: string;
  name: string;
  description: string;
  type: 'jit_access' | 'session_recording' | 'command_filter' | 'mfa_enforcement';
  status: 'enabled' | 'audit_only' | 'disabled';
  lastUpdated: string;
}

export interface PAMAlert {
  id: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  source: string;
  timestamp: string;
  status: 'active' | 'investigating' | 'resolved';
}

export interface PAMDashboardData {
  kpis: PAMKPI[];
  accounts: PAMAccount[];
  requests: PAMRequest[];
  sessions: PAMSession[];
  liveActivities: PAMLiveActivity[];
  recordings: PAMRecording[];
  policies: PAMPolicy[];
  alerts: PAMAlert[];
}
