export interface DataPipeline {
  id: string;
  name: string;
  source: string;
  destination: string;
  status: string;
}

export interface Transformation {
  id: string;
  pipeline_id: string;
  mapping: Record<string, any>;
}

export interface IntegrationEvent {
  id: string;
  pipeline_id: string;
  event_type: string;
  payload: Record<string, any>;
}

export interface SchemaRegistry {
  id: string;
  schema_name: string;
  definition: Record<string, any>;
  version: number;
}
