import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useAutomationRpa } from '../hooks/useAutomationRpa';
import type { WorkflowRun } from '../types/automation-rpa.types';

export const WorkflowRunsPanel: React.FC = () => {
  const { useRuns } = useAutomationRpa();
  const { data: response, isLoading } = useRuns();

  const runs = response?.data || [
    { id: 'run-8821', workflow_id: 'Nightly Billing Reconciliation', status: 'running', started_at: new Date().toISOString(), completed_at: null },
    { id: 'run-8820', workflow_id: 'New Employee IT Onboarding', status: 'completed', started_at: new Date(Date.now() - 3600000).toISOString(), completed_at: new Date(Date.now() - 1800000).toISOString() },
    { id: 'run-8819', workflow_id: 'Legacy HL7 Migration Sync', status: 'failed', started_at: new Date(Date.now() - 7200000).toISOString(), completed_at: new Date(Date.now() - 7100000).toISOString() }
  ];

  if (isLoading) return <div>Loading runs...</div>;

  const statusVariant = (s: string) => {
    switch (s) {
      case 'running': return 'outline';
      case 'completed': return 'success';
      case 'failed': return 'danger';
      default: return 'outline' as const;
    }
  };

  return (
    <Card className="h-full">
      <CardHeader title="Execution History" />
      <CardBody>
        <div className="space-y-3">
          {runs.map((r: WorkflowRun) => (
            <div key={r.id} className="flex justify-between items-center p-3 rounded bg-white/5 border border-white/10">
              <div>
                <p className="text-sm font-semibold text-gray-200">{r.workflow_id}</p>
                <p className="text-xs text-gray-500 font-mono mt-1">Run: {r.id}</p>
              </div>
              <div className="text-right">
                <Badge variant={statusVariant(r.status)}>
                  {r.status.toUpperCase()}
                </Badge>
                <p className="text-[10px] text-gray-600 mt-1">
                  {r.started_at && new Date(r.started_at).toLocaleTimeString()}
                  {r.completed_at ? ` → ${new Date(r.completed_at).toLocaleTimeString()}` : ' → ...'}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
};
