export interface GraphNode {
  id: string;
  entity_type: string;
  properties: Record<string, any>;
}

export interface GraphEdge {
  id: string;
  source_node: string;
  target_node: string;
  relation_type: string;
  properties: Record<string, any>;
}

export interface GraphQuery {
  id: string;
  query: string;
  result_count: number;
  executed_at: string;
}

export interface InferenceResult {
  id: string;
  node_id: string;
  inferred_relations: Record<string, any>;
}
