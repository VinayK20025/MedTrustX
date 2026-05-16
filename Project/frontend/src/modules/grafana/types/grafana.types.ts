export interface GrafanaDashboard {
  id: string;
  name: string;
  config: Record<string, any>;
}

export interface Panel {
  id: string;
  dashboard_id: string;
  panel_type: string;
  query: string | null;
  config: Record<string, any>;
}

export interface DataSource {
  id: string;
  name: string;
  type: string;
  config: Record<string, any>;
}

export interface AlertVisualization {
  id: string;
  alert_id: string;
  dashboard_id: string;
}
