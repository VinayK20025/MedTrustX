import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { useJaeger } from '../hooks/useJaeger';
import type { Dependency } from '../types/jaeger.types';

export const DependenciesPanel: React.FC = () => {
  const { useDependencies } = useJaeger();
  const { data: response, isLoading } = useDependencies();

  const deps = response?.data || [
    { id: '1', parent_service: 'api-gateway', child_service: 'iam-service', call_count: 18420 },
    { id: '2', parent_service: 'clinical-api', child_service: 'patient-service', call_count: 9310 },
    { id: '3', parent_service: 'clinical-api', child_service: 'redis-cache', call_count: 44250 },
    { id: '4', parent_service: 'billing-service', child_service: 'notification-service', call_count: 1820 },
  ];

  if (isLoading) return <div>Loading service dependencies...</div>;

  const maxCalls = Math.max(...deps.map((d: Dependency) => d.call_count));

  return (
    <Card className="h-full">
      <CardHeader title="Service Dependency Topology" />
      <CardBody>
        <div className="space-y-3">
          {deps.map((d: Dependency) => (
            <div key={d.id} className="p-3 bg-white/5 border border-white/10 rounded-lg">
              <div className="flex items-center gap-2 mb-2 text-xs font-mono">
                <span className="bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded">{d.parent_service}</span>
                <svg className="w-4 h-4 text-gray-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                <span className="bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded">{d.child_service}</span>
                <span className="ml-auto text-gray-400 font-semibold">{d.call_count.toLocaleString()} calls</span>
              </div>
              <div className="w-full bg-white/5 rounded-full h-1.5">
                <div
                  className="h-1.5 rounded-full bg-gradient-to-r from-blue-500 to-emerald-500"
                  style={{ width: `${(d.call_count / maxCalls) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
};
