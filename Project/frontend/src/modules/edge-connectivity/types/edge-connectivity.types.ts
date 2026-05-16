export interface EdgeNode {
  id: string;
  name: string;
  location: string | null;
  status: string;
}

export interface ConnectivitySession {
  id: string;
  node_id: string;
  tunnel_type: string;
  status: string;
  started_at: string;
  ended_at: string | null;
}

export interface LinkMetric {
  id: string;
  node_id: string;
  latency: number;
  bandwidth: number;
  packet_loss: number;
  timestamp: string;
}

export interface SyncLog {
  id: string;
  node_id: string;
  sync_status: string;
  data_volume: number;
}
