import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { useMultiTenant } from '../hooks/useMultiTenant';
import type { AccessLog } from '../types/multi-tenant.types';

export const AccessLogsPanel: React.FC = () => {
  const { useLogs } = useMultiTenant();
  const { data: response, isLoading } = useLogs();

  const logs = response?.data || [
    { id: '1', tenant_id: '1', resource_type: 'patient_record', resource_id: 'PR-9982', action: 'read', status: 'granted', created_at: new Date().toISOString() },
    { id: '2', tenant_id: '2', resource_type: 'system_config', resource_id: 'CFG-GLOBAL', action: 'write', status: 'denied', created_at: new Date().toISOString() }
  ];

  if (isLoading) return <div>Loading access logs...</div>;

  return (
    <Card className="h-full">
      <CardHeader title="Cross-Boundary Audit Log" />
      <CardBody>
        <ul className="border-l-2 border-white/10 ml-3 space-y-4">
          {logs.map((log: AccessLog) => (
            <li key={log.id} className="relative pl-4">
              <div className={`absolute -left-[5px] top-1.5 w-2 h-2 rounded-full ${log.status === 'granted' ? 'bg-emerald-500' : 'bg-red-500'}`} />
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-semibold capitalize text-gray-200">{log.action} Attempt</span>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${log.status === 'granted' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                  {log.status.toUpperCase()}
                </span>
              </div>
              <p className="text-xs text-gray-500">
                Resource: <span className="font-mono text-blue-300">{log.resource_type}</span> [{log.resource_id}]
              </p>
              <p className="text-[10px] text-gray-600 mt-0.5">Tenant {log.tenant_id} • {new Date(log.created_at).toLocaleString()}</p>
            </li>
          ))}
        </ul>
      </CardBody>
    </Card>
  );
};
