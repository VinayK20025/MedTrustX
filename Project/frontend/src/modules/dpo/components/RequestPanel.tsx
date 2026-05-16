'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { ClipboardList, Clock, AlertTriangle } from 'lucide-react';
import { cn } from '@/utils/cn';
import type { DataSubjectRequest } from '../types/dpo.types';

interface RequestPanelProps {
  requests: DataSubjectRequest[];
  onSelectRequest?: (id: string) => void;
  activeRequestId?: string;
}

const typeConfig: Record<string, { color: string; bg: string; border: string }> = {
  Access:      { color: 'text-indigo-400',  bg: 'bg-indigo-500/10',  border: 'border-indigo-500/20' },
  Correction:  { color: 'text-amber-400',   bg: 'bg-amber-500/10',   border: 'border-amber-500/20' },
  Deletion:    { color: 'text-rose-400',    bg: 'bg-rose-500/10',    border: 'border-rose-500/20' },
  Portability: { color: 'text-teal-400',    bg: 'bg-teal-500/10',    border: 'border-teal-500/20' },
  Restriction: { color: 'text-purple-400',  bg: 'bg-purple-500/10',  border: 'border-purple-500/20' },
};

export const RequestPanel: React.FC<RequestPanelProps> = ({ requests, onSelectRequest, activeRequestId }) => {
  const getDaysLeft = (due: string) => Math.ceil((new Date(due).getTime() - Date.now()) / 86400000);

  return (
    <Card className="h-full flex flex-col border-white/[0.06] shadow-glass bg-surface-dark">
      <CardHeader
        title="Data Subject Requests"
        icon={<ClipboardList className="w-4 h-4" />}
        action={
          <span className="text-xs bg-rose-500/10 border border-rose-500/20 text-rose-400 px-2 py-0.5 rounded-full">
            {requests.filter(r => r.status !== 'Completed' && r.status !== 'Rejected').length} Open
          </span>
        }
      />
      <CardBody className="flex-1 overflow-y-auto p-0">
        <div className="divide-y divide-white/[0.04]">
          {requests.map((req) => {
            const cfg = typeConfig[req.type] || typeConfig.Access;
            const daysLeft = getDaysLeft(req.dueDate);
            const isUrgent = daysLeft <= 7 && req.status !== 'Completed';

            return (
              <div
                key={req.id}
                onClick={() => onSelectRequest?.(req.id)}
                className={cn(
                  "p-4 cursor-pointer transition-colors hover:bg-white/[0.02] border-l-2",
                  activeRequestId === req.id ? "bg-white/[0.04] border-l-indigo-500" : "border-l-transparent"
                )}
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="text-[10px] font-mono text-gray-500 mb-0.5">{req.id}</p>
                    <h4 className="text-sm font-medium text-white">{req.subjectName}</h4>
                  </div>
                  <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded border uppercase", cfg.bg, cfg.border, cfg.color)}>
                    {req.type}
                  </span>
                </div>

                <div className="flex items-center justify-between mt-2">
                  <span className={cn(
                    "text-[10px] px-1.5 py-0.5 rounded bg-white/5 border border-white/10",
                    req.status === 'Completed' ? 'text-emerald-400' :
                    req.status === 'Under Review' ? 'text-amber-400' : 'text-gray-400'
                  )}>
                    {req.status}
                  </span>
                  <div className={cn("flex items-center gap-1 text-[10px]", isUrgent ? "text-rose-400" : "text-gray-500")}>
                    <Clock className="w-3 h-3" />
                    {daysLeft > 0 ? `${daysLeft}d left` : 'Overdue'}
                    {isUrgent && <AlertTriangle className="w-3 h-3" />}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardBody>
    </Card>
  );
};
