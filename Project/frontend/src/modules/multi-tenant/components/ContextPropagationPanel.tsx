import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { useMultiTenant } from '../hooks/useMultiTenant';
import type { ContextPropagation } from '../types/multi-tenant.types';

export const ContextPropagationPanel: React.FC = () => {
  const { usePropagations } = useMultiTenant();
  const { data: response, isLoading } = usePropagations();

  const propagations = response?.data || [
    { id: '1', tenant_id: '1', request_id: 'REQ-A8B9-21', service_name: 'patient-service', propagated_at: new Date().toISOString() },
    { id: '2', tenant_id: '1', request_id: 'REQ-A8B9-21', service_name: 'billing-service', propagated_at: new Date().toISOString() }
  ];

  if (isLoading) return <div>Loading propagations...</div>;

  return (
    <Card className="h-full">
      <CardHeader title="Context Propagation Trace" />
      <CardBody>
        <div className="space-y-3">
          {propagations.map((p: ContextPropagation) => (
            <div key={p.id} className="flex justify-between items-center p-3 rounded bg-white/5 border border-white/10">
              <div>
                <p className="text-sm font-semibold text-gray-200">{p.service_name}</p>
                <p className="text-[10px] font-mono text-purple-400 mt-1">{p.request_id}</p>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-gray-500 bg-black/50 px-2 py-1 rounded">Tenant {p.tenant_id}</span>
                <p className="text-[10px] text-gray-600 mt-1">{new Date(p.propagated_at).toLocaleTimeString()}</p>
              </div>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
};
