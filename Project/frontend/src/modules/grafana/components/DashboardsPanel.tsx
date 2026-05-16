import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { useGrafana } from '../hooks/useGrafana';
import type { GrafanaDashboard } from '../types/grafana.types';

export const DashboardsPanel: React.FC = () => {
  const { useDashboards } = useGrafana();
  const { data: response, isLoading } = useDashboards();

  const dashboards = response?.data || [
    { id: 'dash-1', name: 'Clinical Operations Overview', config: { refresh: '30s', time_range: '1h', panel_count: 12 } },
    { id: 'dash-2', name: 'Infrastructure Health', config: { refresh: '10s', time_range: '6h', panel_count: 8 } },
    { id: 'dash-3', name: 'Security & Audit Metrics', config: { refresh: '60s', time_range: '24h', panel_count: 6 } },
  ];

  if (isLoading) return <div>Loading dashboards...</div>;

  return (
    <Card className="h-full">
      <CardHeader title="Grafana Dashboards Registry" />
      <CardBody>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {dashboards.map((d: GrafanaDashboard) => (
            <div key={d.id} className="p-4 border border-white/10 rounded-lg bg-white/5 flex flex-col gap-3">
              <div className="flex items-start justify-between">
                <div className="bg-amber-500/20 p-2 rounded-lg">
                  <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                </div>
                <span className="text-[10px] text-gray-500 font-mono bg-white/5 px-2 py-1 rounded">{d.config.panel_count} panels</span>
              </div>
              <h3 className="text-sm font-bold text-gray-200">{d.name}</h3>
              <div className="flex gap-2 text-[10px] font-mono">
                <span className="bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded">refresh: {d.config.refresh}</span>
                <span className="bg-gray-700/50 text-gray-400 px-2 py-0.5 rounded">{d.config.time_range}</span>
              </div>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
};
