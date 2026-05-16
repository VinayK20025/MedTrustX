import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useLegalCaseManagement } from '../hooks/useLegalCaseManagement';
import type { CaseTask } from '../types/legal-case.types';

export const CaseTasksPanel: React.FC = () => {
  const { useTasks } = useLegalCaseManagement();
  const { data: response, isLoading } = useTasks();

  const tasks = response?.data || [
    { id: '1', case_id: '1', task_name: 'Prepare counter-affidavit', status: 'in_progress', assigned_to: 'legal-counsel-03' },
    { id: '2', case_id: '2', task_name: 'Compile audit evidence', status: 'pending', assigned_to: 'compliance-officer-01' }
  ];

  if (isLoading) return <div>Loading tasks...</div>;

  const statusVariant = (s: string) => s === 'in_progress' ? 'warning' : s === 'completed' ? 'success' : 'outline';

  return (
    <Card className="h-full">
      <CardHeader title="Case Workflow Tasks" />
      <CardBody>
        <div className="space-y-3">
          {tasks.map((task: CaseTask) => (
            <div key={task.id} className="p-3 bg-white/5 rounded border border-white/10">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-semibold">{task.task_name}</span>
                <Badge variant={statusVariant(task.status)}>
                  {task.status.replace('_', ' ').toUpperCase()}
                </Badge>
              </div>
              <p className="text-xs text-gray-500">Assigned: {task.assigned_to}</p>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
};
