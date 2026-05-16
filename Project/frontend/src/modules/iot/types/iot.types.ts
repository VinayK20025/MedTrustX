export interface DeviceConnection {
  id: string;
  device_id: string;
  status: string;
  connected_at: string;
}

export interface MqttTopic {
  id: string;
  topic: string;
  qos: number;
}

export interface MessageLog {
  id: string;
  device_id: string;
  topic: string;
  payload: Record<string, any>;
  received_at: string;
}

export interface DeviceCommand {
  id: string;
  device_id: string;
  command: Record<string, any>;
  status: string;
  sent_at: string;
}

export interface DeviceEvent {
  id: string;
  device_id: string;
  event_type: string;
  payload: Record<string, any>;
}
