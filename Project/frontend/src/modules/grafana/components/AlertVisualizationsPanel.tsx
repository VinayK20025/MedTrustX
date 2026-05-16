import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { useGrafana } from '../hooks/useGrafana';
import type { AlertVisualization } from '../types/grafana.types';

export const AlertVisualizationsPanel: React.FC = () => {
  const { useAlertVisualizations } = useGrafana();
  const { data: response, isLoading } = useAlertVisualizations();

  const alerts = response?.data || [
    { id: 'av-1', alert_id: 'alert-high-cpu', dashboard_id: 'dash-2' },
    { id: 'av-2', alert_id: 'alert-db-latency', dashboard_id: 'dash-1' },
    { id: 'av-3', alert_id: 'alert-auth-failures', dashboard_id: 'dash-3' },
  ];

  if (isLoading) return <div>Loading alert visualizations...</div>;

  return (
    <Card className="h-full">
      <CardHeader title="Alert ↔ Panel Mappings" />
      <CardBody>
        <div className="space-y-3">
          {alerts.map((av: AlertVisualization) => (
            <div key={av.id} className="p-3 bg-white/5 border border-white/10 rounded-lg flex items-center gap-4">
              <div className="bg-red-500/20 p-2 rounded-lg shrink-0">
                <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-red-400 font-mono truncate">{av.alert_id}</p>
                <p className="text-[10px] text-gray-500 font-mono mt-1">Mapped to dashboard: <span className="text-blue-400">{av.dashboard_id}</span></p>
              </div>
              <span className="text-[10px] text-gray-600 font-mono shrink-0">{av.id}</span>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
};
