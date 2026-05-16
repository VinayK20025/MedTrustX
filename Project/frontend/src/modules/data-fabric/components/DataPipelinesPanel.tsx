import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useDataFabric } from '../hooks/useDataFabric';
import type { DataPipeline } from '../types/data-fabric.types';

export const DataPipelinesPanel: React.FC = () => {
  const { usePipelines } = useDataFabric();
  const { data: response, isLoading } = usePipelines();

  const pipelines = response?.data || [
    { id: '1', name: 'Legacy EMR Ingestion', source: 'MSSQL_ClinicA', destination: 'Kafka_Raw_Topic', status: 'running' },
    { id: '2', name: 'Claims Aggregation', source: 'Postgres_Billing', destination: 'ClickHouse_OLAP', status: 'idle' },
    { id: '3', name: 'Patient Vitals Sync', source: 'IoT_Gateway', destination: 'TimescaleDB', status: 'failed' }
  ];

  if (isLoading) return <div>Loading data pipelines...</div>;

  const statusVariant = (s: string) => {
    switch (s) {
      case 'running': return 'success';
      case 'idle': return 'outline';
      case 'failed': return 'danger';
      default: return 'outline' as const;
    }
  };

  return (
    <Card className="h-full">
      <CardHeader title="Data Integration Pipelines" />
      <CardBody>
        <div className="grid grid-cols-1 gap-4">
          {pipelines.map((p: DataPipeline) => (
            <div key={p.id} className="p-4 border border-white/10 rounded-lg bg-white/5 flex justify-between items-center">
              <div className="flex-1">
                <p className="font-semibold text-gray-200">{p.name}</p>
                <div className="flex items-center gap-2 mt-2 text-xs font-mono text-gray-400">
                  <span className="bg-black/40 px-2 py-1 rounded truncate max-w-[150px]">{p.source}</span>
                  <span className="text-emerald-500">→</span>
                  <span className="bg-black/40 px-2 py-1 rounded truncate max-w-[150px]">{p.destination}</span>
                </div>
              </div>
              <Badge variant={statusVariant(p.status)}>
                {p.status.toUpperCase()}
              </Badge>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
};
