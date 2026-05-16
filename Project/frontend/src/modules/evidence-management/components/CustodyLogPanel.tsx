import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { useEvidenceManagement } from '../hooks/useEvidenceManagement';
import type { CustodyLog } from '../types/evidence.types';

export const CustodyLogPanel: React.FC = () => {
  const { useCustodyLogs } = useEvidenceManagement();
  const { data: response, isLoading } = useCustodyLogs();

  const logs = response?.data || [
    { id: '1', evidence_id: '1', action: 'uploaded', performed_by: 'forensic-officer-01', timestamp: new Date().toISOString() },
    { id: '2', evidence_id: '1', action: 'sealed', performed_by: 'legal-counsel-03', timestamp: new Date().toISOString() }
  ];

  if (isLoading) return <div>Loading custody logs...</div>;

  const actionIcon = (a: string) => {
    switch (a) {
      case 'uploaded': return '⬆️';
      case 'accessed': return '👁️';
      case 'transferred': return '🔄';
      case 'sealed': return '🔒';
      default: return '📋';
    }
  };

  return (
    <Card className="h-full">
      <CardHeader title="Chain of Custody" />
      <CardBody>
        <ul className="border-l-2 border-white/10 ml-3 space-y-4">
          {logs.map((log: CustodyLog) => (
            <li key={log.id} className="relative pl-4">
              <div className="absolute -left-[5px] top-1.5 w-2 h-2 rounded-full bg-teal-500" />
              <div className="flex items-center gap-2">
                <span>{actionIcon(log.action)}</span>
                <span className="text-sm font-medium text-teal-400 capitalize">{log.action}</span>
              </div>
              <p className="text-xs text-gray-400 mt-1">By: {log.performed_by}</p>
              <p className="text-xs text-gray-500">{new Date(log.timestamp).toLocaleString()}</p>
            </li>
          ))}
        </ul>
      </CardBody>
    </Card>
  );
};
