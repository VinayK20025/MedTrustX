export interface Asset {
  id: string;
  name: string;
  type: string;
  status: string;
}

export interface Tag {
  id: string;
  asset_id: string;
  tag_type: string;
  identifier: string;
  status: string;
}

export interface Location {
  id: string;
  asset_id: string;
  zone: string;
  coordinates: Record<string, any>;
  timestamp: string;
}

export interface MovementEvent {
  id: string;
  asset_id: string;
  from_zone: string;
  to_zone: string;
}
