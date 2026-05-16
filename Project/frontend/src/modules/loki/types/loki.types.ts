export interface LogStream {
  id: string;
  labels: Record<string, string>;
}

export interface LogEntry {
  id: string;
  stream_id: string;
  log: string;
  timestamp: string;
}

export interface LogIndex {
  id: string;
  label_key: string;
  label_value: string;
  stream_id: string;
}
