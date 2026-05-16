import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { useGrafana } from '../hooks/useGrafana';
import type { Panel } from '../types/grafana.types';

const panelTypeIcon = (type: string) => {
  switch (type) {
    case 'timeseries': return '📈';
    case 'stat': return '🔢';
    case 'table': return '📋';
    case 'gauge': return '🎯';
    case 'heatmap': return '🟩';
    default: return '📊';
  }
};

export const PanelsPanel: React.FC = () => {
  const { usePanels } = useGrafana();
  const { data: response, isLoading } = usePanels();

  const panels = response?.data || [
    { id: 'p-1', dashboard_id: 'dash-1', panel_type: 'timeseries', query: 'rate(http_requests_total[5m])', config: { title: 'Request Rate', unit: 'req/s' } },
    { id: 'p-2', dashboard_id: 'dash-1', panel_type: 'stat', query: 'up{job="clinical-api"}', config: { title: 'Service Uptime', thresholds: [{ value: 0.99, color: 'green' }] } },
    { id: 'p-3', dashboard_id: 'dash-2', panel_type: 'table', query: null, config: { title: 'Container Resource Usage' } },
  ];

  if (isLoading) return <div>Loading panels...</div>;

  return (
    <Card className="h-full">
      <CardHeader title="Dashboard Panels" />
      <CardBody>
        <div className="space-y-3">
          {panels.map((p: Panel) => (
            <div key={p.id} className="p-3 border border-white/10 rounded-lg bg-white/5 flex justify-between items-start">
              <div className="flex items-start gap-3">
                <span className="text-lg mt-0.5">{panelTypeIcon(p.panel_type)}</span>
                <div>
                  <p className="text-sm font-semibold text-gray-200">{p.config.title}</p>
                  <p className="text-[10px] text-gray-500 font-mono mt-1 capitalize">{p.panel_type}</p>
                  {p.query && (
                    <p className="text-[10px] text-blue-400 font-mono mt-1 truncate max-w-[260px]">{p.query}</p>
                  )}
                </div>
              </div>
              <span className="text-[10px] text-gray-600 font-mono shrink-0">dash: {p.dashboard_id.split('-')[1]}</span>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
};
