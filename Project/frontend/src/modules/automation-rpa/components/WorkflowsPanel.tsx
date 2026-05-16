import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useAutomationRpa } from '../hooks/useAutomationRpa';
import type { Workflow } from '../types/automation-rpa.types';

export const WorkflowsPanel: React.FC = () => {
  const { useWorkflows } = useAutomationRpa();
  const { data: response, isLoading } = useWorkflows();

  const workflows = response?.data || [
    { id: '1', name: 'Nightly Billing Reconciliation', status: 'active', definition: { steps: 5, trigger: 'cron' } },
    { id: '2', name: 'New Employee IT Onboarding', status: 'active', definition: { steps: 12, trigger: 'webhook' } },
    { id: '3', name: 'Legacy HL7 Migration Sync', status: 'paused', definition: { steps: 3, trigger: 'manual' } }
  ];

  if (isLoading) return <div>Loading workflows...</div>;

  const statusVariant = (s: string) => {
    switch (s) {
      case 'active': return 'success';
      case 'paused': return 'warning';
      case 'failed': return 'danger';
      default: return 'outline' as const;
    }
  };

  return (
    <Card className="h-full">
      <CardHeader title="Automated Workflows" />
      <CardBody>
        <div className="grid grid-cols-1 gap-4">
          {workflows.map((wf: Workflow) => (
            <div key={wf.id} className="p-4 border border-white/10 rounded-lg bg-white/5 flex justify-between items-center">
              <div>
                <p className="font-semibold text-gray-200">{wf.name}</p>
                <div className="flex gap-4 mt-2 text-xs">
                  <span className="text-gray-400 capitalize">Trigger: {wf.definition.trigger}</span>
                  <span className="text-gray-400">Steps: {wf.definition.steps}</span>
                </div>
              </div>
              <Badge variant={statusVariant(wf.status)}>
                {wf.status.toUpperCase()}
              </Badge>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
};
