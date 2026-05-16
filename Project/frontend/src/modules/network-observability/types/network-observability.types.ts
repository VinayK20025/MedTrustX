export interface NetworkFlow {
  id: string;
  source_ip: string;
  destination_ip: string;
  protocol: string;
  bytes: number;
  timestamp: string;
}

export interface TrafficMetric {
  id: string;
  metric_name: string;
  value: number;
  timestamp: string;
}

export interface Dependency {
  id: string;
  source_service: string;
  destination_service: string;
  latency: number;
}

export interface Anomaly {
  id: string;
  type: string;
  severity: string;
  details: Record<string, any>;
}
