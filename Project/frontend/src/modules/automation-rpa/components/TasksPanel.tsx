import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { useAutomationRpa } from '../hooks/useAutomationRpa';
import type { Task } from '../types/automation-rpa.types';

export const TasksPanel: React.FC = () => {
  const { useTasks } = useAutomationRpa();
  const { data: response, isLoading } = useTasks();

  const tasks = response?.data || [
    { id: 'task-1', workflow_id: 'run-8821', task_type: 'db_query', status: 'completed', payload: { query: 'SELECT * FROM billing_queue' } },
    { id: 'task-2', workflow_id: 'run-8821', task_type: 'api_post', status: 'running', payload: { endpoint: '/v1/reconcile' } },
    { id: 'task-3', workflow_id: 'run-8819', task_type: 'ui_click', status: 'failed', payload: { selector: '#submit-btn', error: 'Element not found' } }
  ];

  if (isLoading) return <div>Loading tasks...</div>;

  return (
    <Card className="h-full">
      <CardHeader title="Task Execution Trace" />
      <CardBody>
        <ul className="border-l-2 border-white/10 ml-3 space-y-4">
          {tasks.map((t: Task) => (
            <li key={t.id} className="relative pl-4">
              <div className={`absolute -left-[5px] top-1.5 w-2 h-2 rounded-full ${t.status === 'completed' ? 'bg-emerald-500' : t.status === 'running' ? 'bg-blue-500' : 'bg-red-500'}`} />
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-semibold capitalize text-gray-200">{t.task_type.replace('_', ' ')}</span>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${t.status === 'completed' ? 'bg-emerald-500/20 text-emerald-400' : t.status === 'running' ? 'bg-blue-500/20 text-blue-400' : 'bg-red-500/20 text-red-400'}`}>
                  {t.status.toUpperCase()}
                </span>
              </div>
              <p className="text-[10px] text-gray-500 font-mono mt-1">Run Ref: {t.workflow_id}</p>
              <div className="text-[10px] text-gray-400 mt-2 font-mono bg-black/30 p-2 rounded break-words">
                {JSON.stringify(t.payload)}
              </div>
            </li>
          ))}
        </ul>
      </CardBody>
    </Card>
  );
};
