export interface AccessPoint {
  id: string;
  name: string;
  location: string;
  status: string;
}

export interface Credential {
  id: string;
  user_id: string;
  type: string;
  value: string;
  status: string;
}

export interface AccessPolicy {
  id: string;
  role: string;
  zone: string;
  rules: Record<string, any>;
}

export interface AccessLog {
  id: string;
  user_id: string | null;
  access_point_id: string;
  action: string;
  status: string;
  created_at: string;
}
