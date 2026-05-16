export interface Trace {
  id: string;
  trace_id: string;
  service_name: string;
  duration: number;
  started_at: string;
}

export interface Span {
  id: string;
  trace_id: string;
  span_id: string;
  parent_span_id: string | null;
  operation_name: string;
  duration: number;
  started_at: string;
}

export interface Dependency {
  id: string;
  parent_service: string;
  child_service: string;
  call_count: number;
}
