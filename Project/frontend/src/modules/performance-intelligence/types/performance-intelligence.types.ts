export interface PerformanceMetric {
  id: string;
  service_name: string;
  metric_name: string;
  value: number;
  timestamp: string;
}

export interface Benchmark {
  id: string;
  service_name: string;
  metric_name: string;
  baseline: number;
}

export interface PerformanceScore {
  id: string;
  service_name: string;
  score: number;
  evaluated_at: string;
}

export interface OptimizationInsight {
  id: string;
  service_name: string;
  insight: string;
  impact: number;
}
