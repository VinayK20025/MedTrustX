export interface Camera {
  id: string;
  name: string;
  location: string;
  status: string;
}

export interface VideoStream {
  id: string;
  camera_id: string;
  stream_url: string;
  status: string;
}

export interface Recording {
  id: string;
  camera_id: string;
  file_path: string;
  start_time: string;
  end_time: string;
}

export interface SurveillanceEvent {
  id: string;
  camera_id: string;
  event_type: string;
  metadata_json: Record<string, any>;
}
