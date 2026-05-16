/**
 * MedTrustX — Config Service Types
 */

export type ConfigValueType = 'string' | 'number' | 'boolean' | 'json';
export type ConfigScope = 'Global' | 'Service' | 'Tenant' | 'Environment';

export interface GlobalConfig {
  id: string;
  key: string;
  value: string;
  type: ConfigValueType;
  scope: ConfigScope;
  description: string;
  lastUpdated: string;
  updatedBy: string;
}

export interface FeatureFlag {
  id: string;
  name: string;
  key: string;
  status: 'Enabled' | 'Disabled' | 'Gradual Rollout';
  percentage?: number;
  environment: 'Production' | 'Staging' | 'Development';
}

export interface TenantOverride {
  id: string;
  tenantId: string;
  tenantName: string;
  key: string;
  value: string;
  reason: string;
}

export interface ConfigAuditEntry {
  id: string;
  timestamp: string;
  user: string;
  action: 'Created' | 'Updated' | 'Deleted';
  key: string;
  oldValue?: string;
  newValue?: string;
}

export interface ConfigMetrics {
  totalConfigs: number;
  activeFeatureFlags: number;
  pendingOverrides: number;
  configHealthScorePercent: number;
  lastDeploymentTime: string;
}

export interface ConfigDashboardData {
  metrics: ConfigMetrics;
  recentConfigs: GlobalConfig[];
  featureFlags: FeatureFlag[];
  recentAudits: ConfigAuditEntry[];
}
