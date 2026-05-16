export interface ApiComposition {
  id: string;
  name: string;
  definition: Record<string, any>;
}

export interface CompositionLog {
  id: string;
  composition_id: string;
  status: string;
  response_time: number;
}

export interface CompositionRoute {
  id: string;
  path: string;
  method: string;
  composition_id: string;
}
