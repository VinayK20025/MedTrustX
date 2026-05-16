import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { useGrafana } from '../hooks/useGrafana';
import type { DataSource } from '../types/grafana.types';

const dsTypeColor = (type: string) => {
  switch (type) {
    case 'prometheus': return 'text-orange-400 bg-orange-500/10';
    case 'clickhouse': return 'text-yellow-400 bg-yellow-500/10';
    case 'loki': return 'text-blue-400 bg-blue-500/10';
    default: return 'text-gray-400 bg-gray-500/10';
  }
};

export const DataSourcesPanel: React.FC = () => {
  const { useDataSources } = useGrafana();
  const { data: response, isLoading } = useDataSources();

  const sources = response?.data || [
    { id: 'ds-1', name: 'Prometheus Main', type: 'prometheus', config: { url: 'http://prometheus:9090', scrape_interval: '15s' } },
    { id: 'ds-2', name: 'ClickHouse Analytics', type: 'clickhouse', config: { host: 'clickhouse', port: 8123, database: 'medtrustx' } },
    { id: 'ds-3', name: 'Loki Logs', type: 'loki', config: { url: 'http://loki:3100' } },
  ];

  if (isLoading) return <div>Loading data sources...</div>;

  return (
    <Card className="h-full">
      <CardHeader title="Registered Data Sources" />
      <CardBody>
        <div className="space-y-3">
          {sources.map((ds: DataSource) => (
            <div key={ds.id} className="p-4 border border-white/10 rounded-lg bg-white/5 flex justify-between items-center">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded font-mono ${dsTypeColor(ds.type)}`}>{ds.type}</span>
                  <h3 className="text-sm font-semibold text-gray-200">{ds.name}</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(ds.config).map(([k, v]) => (
                    <span key={k} className="text-[10px] text-gray-500 font-mono bg-black/40 px-1.5 py-0.5 rounded">{k}: {String(v)}</span>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-1.5 ml-4">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[10px] text-emerald-400 font-mono">CONNECTED</span>
              </div>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
};
