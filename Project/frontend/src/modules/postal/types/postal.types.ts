export interface EmailMessage {
  id: string;
  to_address: string;
  subject: string;
  body: string;
  status: string;
}

export interface EmailLog {
  id: string;
  message_id: string;
  status: string;
  response: string;
  logged_at: string;
}

export interface EmailQueue {
  id: string;
  message_id: string;
  retry_count: number;
  next_attempt: string;
}

export interface EmailBounce {
  id: string;
  message_id: string;
  bounce_type: string;
  description: string | null;
}
