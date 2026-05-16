export interface AccessPolicy {
  id: string;
  policy_name: string;
  rules: Record<string, any>;
}

export interface NetworkSession {
  id: string;
  user_id: string;
  device_id: string;
  status: string;
  started_at: string;
  ended_at: string | null;
}

export interface DevicePosture {
  id: string;
  device_id: string;
  compliance_status: string;
  attributes: Record<string, any>;
}

export interface AccessDecision {
  id: string;
  session_id: string;
  decision: string;
  reason: string | null;
}
