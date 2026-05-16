'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import type { PharmacyTaskQueueItem } from '../types/pharmacyTech.types';
import { ClipboardList, AlertTriangle, Clock } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { tasks: PharmacyTaskQueueItem[]; }

export function PharmacyTechTaskQueue({ tasks }: Props) {
  return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col">
      <CardHeader className="border-b border-white/[0.04] px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-orange-500/15"><ClipboardList className="w-4 h-4 text-orange-400" /></div>
          <h3 className="text-[15px] font-bold text-white tracking-wide">Preparation Queue</h3>
        </div>
      </CardHeader>

      <CardBody className="p-0 flex-1 overflow-y-auto max-h-[500px]">
        <div className="divide-y divide-white/[0.03]">
          {tasks.map(t => (
            <div key={t.id} className={cn("p-5 transition-colors cursor-pointer", t.priority === 'STAT' ? "bg-emergency/5 border-l-2 border-emergency" : "hover:bg-white/[0.015]")}>
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="text-[14px] font-bold text-white flex items-center gap-2">
                    {t.taskType}
                    {t.priority === 'STAT' && <AlertTriangle className="w-4 h-4 text-emergency-light animate-pulse" />}
                  </h4>
                  <p className="text-[11px] text-gray-400 mt-1 flex items-center gap-2 font-mono">
                    {t.prescriptionId} <span>•</span> {t.id}
                  </p>
                </div>
                <span className={cn('text-[9px] uppercase font-bold px-2 py-0.5 rounded tracking-wider', 
                  t.priority === 'STAT' ? 'bg-emergency/20 text-emergency-light' : 
                  t.priority === 'Urgent' ? 'bg-warning/20 text-warning-light' : 'bg-orange-500/20 text-orange-400'
                )}>
                  {t.priority}
                </span>
              </div>

              <div className="flex justify-between items-center mt-4 border-t border-white/[0.04] pt-3">
                <div className="flex gap-2">
                  <span className={cn("text-[10px] uppercase font-bold px-2 py-1 rounded border", 
                     t.status === 'In Progress' ? 'text-blue-400 border-blue-500/30 bg-blue-500/10' : 
                     t.status === 'Ready for Handover' ? 'text-success-400 border-success-500/30 bg-success-500/10' : 'text-gray-400 border-white/5'
                  )}>{t.status}</span>
                </div>
                <span className="flex items-center gap-1 text-[9px] font-mono text-gray-500">
                  <Clock className="w-3 h-3" /> Assign: {new Date(t.timeAssigned).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}
