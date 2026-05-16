export interface ConferenceRoom {
  id: string;
  room_name: string;
  created_by: string;
}

export interface Participant {
  id: string;
  room_id: string;
  user_id: string;
  role: string;
  joined_at: string;
}

export interface ConferenceSession {
  id: string;
  room_id: string;
  started_at: string;
  ended_at: string | null;
  status: string;
}

export interface MediaLog {
  id: string;
  session_id: string;
  event_type: string;
  payload: Record<string, any>;
}
