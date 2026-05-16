'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import type { MetWorkLog } from '../types/met.types';
import { FileText } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { logs: MetWorkLog[]; }

export function MetLogPanel({ logs }: Props) {
  return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col">
      <CardHeader className="border-b border-white/[0.04] px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-indigo-500/15"><FileText className="w-4 h-4 text-indigo-400" /></div>
          <h3 className="text-[15px] font-bold text-white tracking-wide">My Work Logs</h3>
        </div>
      </CardHeader>

      <CardBody className="p-0 flex-1 overflow-y-auto max-h-[300px]">
        {logs.length === 0 ? (
           <div className="p-8 text-center text-[12px] text-gray-500 font-bold">No recent service logs.</div>
        ) : (
          <div className="divide-y divide-white/[0.03]">
            {logs.map(log => (
              <div key={log.id} className="p-5 hover:bg-white/[0.015] transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="text-[13px] font-bold text-white">{log.deviceId}</h4>
                  <span className={cn('text-[9px] uppercase font-bold px-2 py-0.5 rounded tracking-wider', 
                    log.status === 'Resolved' ? 'bg-success/20 text-success-light' : 'bg-warning/20 text-warning-light'
                  )}>
                    {log.status}
                  </span>
                </div>
                <p className="text-[11px] text-gray-400 italic mb-3">"{log.resolution}"</p>
                <div className="flex justify-between items-center text-[9px] text-gray-500 font-mono">
                  <span>Task: {log.taskId}</span>
                  <span>Duration: {log.durationMinutes}m</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardBody>
    </Card>
  );
}
