export interface ConsoleSession {
  id: string;
  user_id: string;
  started_at: string;
  ended_at: string | null;
}

export interface TopicView {
  id: string;
  topic_name: string;
  accessed_at: string;
}

export interface ConsumerGroupView {
  id: string;
  group_name: string;
  lag: number;
  checked_at: string;
}
