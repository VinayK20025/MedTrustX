export interface StreamTopic {
  id: string;
  topic_name: string;
  partitions: number;
  replication_factor: number;
}

export interface StreamMessage {
  id: string;
  topic: string;
  key: string | null;
  value: Record<string, any>;
  partition: number;
  offset: number;
}

export interface ConsumerOffset {
  id: string;
  consumer_group: string;
  topic: string;
  partition: number;
  offset: number;
}
