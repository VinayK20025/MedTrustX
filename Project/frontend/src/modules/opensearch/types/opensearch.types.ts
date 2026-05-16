export interface SearchIndex {
  id: string;
  index_name: string;
  mappings: Record<string, any>;
}

export interface IndexedDocument {
  id: string;
  index_name: string;
  document: Record<string, any>;
  created_at: string;
}

export interface SearchQuery {
  id: string;
  query: string;
  result_count: number;
  executed_at: string;
}
