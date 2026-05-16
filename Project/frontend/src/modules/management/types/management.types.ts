/**
 * MedTrustX — Management Service Types
 * Enterprise command center for cross-functional task, policy, and routing oversight.
 */

export type ManagementPriority = 'low' | 'medium' | 'high' | 'critical';
export type ManagementStatus = 'open' | 'in_progress' | 'blocked' | 'resolved' | 'monitoring';

export interface ManagementKPI {
  id: string;
  title: string;
  value: string | number;
  status: 'normal' | 'success' | 'warning' | 'critical';
  delta?: string;
  actionLabel?: string;
  actionUrl?: string;
}

export interface ManagementTask {
  id: string;
  title: string;
  category: string;
  owner: string;
  priority: ManagementPriority;
  status: ManagementStatus;
  dueAt?: string;
  updatedAt: string;
  route?: string;
  tags?: string[];
  description?: string;
}

export interface ManagementRoute {
  id: string;
  name: string;
  source: string;
  destination: string;
  condition: string;
  active: boolean;
  throughputPerHour: number;
  latencyMs: number;
  status: 'healthy' | 'degraded' | 'paused';
}

export interface ManagementOperationalPanel {
  id: string;
  name: string;
  subtitle: string;
  href: string;
  status: 'healthy' | 'watch' | 'alert';
  count: number;
  description: string;
}

export interface ManagementDashboardData {
  kpis: ManagementKPI[];
  workItems: ManagementTask[];
  routes: ManagementRoute[];
  operationalPanels: ManagementOperationalPanel[];
  externalModules: Array<{ label: string; href: string; description: string }>;
}
