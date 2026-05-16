'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { QCProtocol } from '../types/labTech.types';
import { CheckSquare } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { qcTasks: QCProtocol[]; }

export function LabTechQCPanel({ qcTasks }: Props) {
  return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col">
      <CardHeader className="border-b border-white/[0.04] px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-teal-500/15"><CheckSquare className="w-4 h-4 text-teal-400" /></div>
          <h3 className="text-[15px] font-bold text-white tracking-wide">Daily QC Tasks</h3>
        </div>
      </CardHeader>

      <CardBody className="p-0 flex-1 overflow-y-auto max-h-[300px]">
        <div className="divide-y divide-white/[0.03]">
          {qcTasks.map(qc => (
            <div key={qc.id} className="p-4 hover:bg-white/[0.015] transition-colors">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="text-[13px] font-bold text-white">{qc.taskName}</h4>
                  <p className="text-[10px] text-gray-500 mt-0.5">{qc.instrumentId}</p>
                </div>
                <span className={cn('text-[9px] uppercase font-bold px-2 py-0.5 rounded tracking-wider', 
                  qc.status === 'Passed' ? 'bg-success/20 text-success-light' : 
                  qc.status === 'Pending' ? 'bg-warning/20 text-warning-light' : 'bg-emergency/20 text-emergency-light'
                )}>
                  {qc.status}
                </span>
              </div>
              
              {qc.status === 'Pending' && (
                <div className="mt-3 flex justify-end border-t border-white/[0.04] pt-3">
                  <Button size="xs" variant="outline" className="h-7 text-[10px] text-white">Execute Protocol</Button>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}
