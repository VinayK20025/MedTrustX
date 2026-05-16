/**
 * MedTrustX — Kong Gateway Service Types (Extended)
 * Covers Kong entities: Services, Routes, Plugins, Consumers, Upstreams, Targets.
 */

// ─── Existing types (preserved) ───────────────────────────────────────────
export type ApiStatus   = 'Active' | 'Deprecated' | 'Draft' | 'Suspended';
export type HttpMethod  = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'ANY';
export type AuthMethod  = 'OAuth2' | 'API Key' | 'JWT' | 'mTLS' | 'None';

export interface GatewayApi {
  id: string; name: string; basePath: string; version: string; status: ApiStatus;
  upstreamService: string; authMethod: AuthMethod; rateLimitPerMin: number;
  requestsToday: number; errorRate: number; avgLatencyMs: number; consumers: number; tags: string[];
}
export interface GatewayRoute {
  id: string; apiId: string; path: string; method: HttpMethod; destination: string;
  stripPrefix: boolean; loadBalancer: 'Round Robin' | 'Least Conn' | 'IP Hash';
  healthStatus: 'Healthy' | 'Degraded' | 'Down'; callsToday: number; avgLatencyMs: number;
}
export interface SecurityPolicy {
  id: string; name: string;
  type: 'OAuth2' | 'API Key' | 'Rate Limit' | 'IP Allowlist' | 'JWT Validation' | 'CORS' | 'TLS';
  status: 'Enabled' | 'Disabled'; scope: string; blockedToday: number;
}
export interface RateLimitPolicy {
  id: string; apiId: string; apiName: string; limitPerMin: number; limitPerDay: number;
  currentUsagePct: number; throttledToday: number; action: 'Block' | 'Throttle' | 'Warn';
}
export interface TrafficAlert {
  id: string; title: string; apiName: string; severity: 'Critical' | 'High' | 'Medium';
  status: 'Firing' | 'Acknowledged' | 'Resolved';
  type: 'Spike' | 'Error Rate' | 'Latency' | 'Auth Failure' | 'Circuit Breaker';
  firedAt: string; details: string;
}
export interface TrafficDataPoint { time: string; requests: number; errors: number; latencyMs: number; }
export interface GatewayMetrics {
  requestsToday: number; requestsPerHour: number; errorRate: number; avgLatencyMs: number;
  successRate: number; activeApis: number; blockedRequests: number; firingAlerts: number;
}
export interface GatewayData {
  metrics: GatewayMetrics; apis: GatewayApi[]; routes: GatewayRoute[];
  securityPolicies: SecurityPolicy[]; rateLimits: RateLimitPolicy[];
  alerts: TrafficAlert[]; trafficTimeline: TrafficDataPoint[];
}

// ─── Kong-specific entities ────────────────────────────────────────────────
export type PluginScope   = 'Global' | 'Service' | 'Route' | 'Consumer';
export type PluginStatus  = 'enabled' | 'disabled';
export type UpstreamAlgo  = 'round-robin' | 'consistent-hashing' | 'least-connections' | 'latency';
export type TargetStatus  = 'healthy' | 'unhealthy' | 'dns_error';
export type ConsumerAuthType = 'key-auth' | 'oauth2' | 'jwt' | 'basic-auth' | 'hmac-auth';

export interface KongService {
  id: string;
  name: string;
  protocol: 'http' | 'https' | 'grpc' | 'grpcs';
  host: string;
  port: number;
  path: string;
  connectTimeout: number;
  writeTimeout: number;
  readTimeout: number;
  retries: number;
  tags: string[];
  enabled: boolean;
  routeCount: number;
  requestsPerMin: number;
  latencyP99: number;
  errorRate: number;
}

export interface KongPlugin {
  id: string;
  name: string;
  scope: PluginScope;
  scopeTarget?: string;
  status: PluginStatus;
  config: Record<string, string | number | boolean | string[]>;
  priority: number;
  appliedToday: number;
  blockedToday: number;
}

export interface KongUpstream {
  id: string;
  name: string;
  algorithm: UpstreamAlgo;
  hashOn?: string;
  slots: number;
  healthCheckEnabled: boolean;
  healthCheckInterval: number;
  targets: KongTarget[];
}

export interface KongTarget {
  id: string;
  target: string; // host:port
  weight: number;
  status: TargetStatus;
  latencyMs: number;
  successRate: number;
}

export interface KongConsumer {
  id: string;
  username: string;
  customId?: string;
  authType: ConsumerAuthType;
  tags: string[];
  requestsToday: number;
  rateLimitTier: 'free' | 'standard' | 'premium' | 'internal';
  blocked: boolean;
  lastSeen: string;
}

export interface KongGatewayData extends GatewayData {
  kongServices: KongService[];
  plugins: KongPlugin[];
  upstreams: KongUpstream[];
  consumers: KongConsumer[];
}
