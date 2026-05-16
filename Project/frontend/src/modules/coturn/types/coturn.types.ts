export interface TurnSession {
  id: string;
  user_id: string;
  session_id: string;
  relay_ip: string;
  started_at: string;
  ended_at: string | null;
}

export interface TurnCredential {
  id: string;
  username: string;
  credential: string;
  expires_at: string;
}

export interface RelayUsageLog {
  id: string;
  session_id: string;
  bytes_transferred: number;
}
