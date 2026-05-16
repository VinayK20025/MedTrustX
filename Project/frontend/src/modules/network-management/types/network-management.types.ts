export interface ManagedDevice {
  id: string;
  device_type: string;
  ip_address: string;
  status: string;
}

export interface DeviceMetric {
  id: string;
  device_id: string;
  metric_name: string;
  value: number;
  timestamp: string;
}

export interface NetworkTopology {
  id: string;
  source_device: string;
  target_device: string;
  link_status: string;
}

export interface FaultEvent {
  id: string;
  device_id: string;
  fault_type: string;
  severity: string;
}
