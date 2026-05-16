'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { CleaningTask } from '../types/housekeeping.types';
import { useUpdateCleaningStatus, useToggleChecklistItem } from '../hooks/useHousekeepingAnalytics';
import { Sparkles, Trash2, ShieldAlert, Droplet, Brush, Play, CheckCircle2, AlertCircle } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { task?: CleaningTask; }

const IconMap: Record<string, React.ElementType> = {
  waste: Trash2,
  disinfect: ShieldAlert,
  sweep: Brush,
  mop: Droplet,
  equipment: Sparkles
};

export function CleaningWorkspace({ task }: Props) {
  const { mutate: updateStatus } = useUpdateCleaningStatus();
  const { mutate: toggleItem } = useToggleChecklistItem();

  if (!task) {
    return (
      <Card className="border-cyan-500/20 shadow-glass bg-[#020506] h-full flex items-center justify-center">
        <div className="text-center opacity-40">
          <Sparkles className="w-12 h-12 text-cyan-500 mx-auto mb-3" />
          <p className="text-gray-400 font-bold">Select a cleaning task.</p>
        </div>
      </Card>
    );
  }

  const allCompleted = task.checklist.every(c => c.isCompleted);

  return (
    <Card className="border-cyan-500/20 shadow-glass bg-[#020506] h-full flex flex-col relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-cyan-800 via-cyan-500 to-blue-400" />

      <CardHeader className="border-b border-white/[0.04] p-5 pb-4">
        <div className="flex justify-between items-start mb-2">
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Location: {task.area}</span>
          <span className={cn('text-[10px] font-bold px-2 py-1 rounded border uppercase tracking-wider',
            task.status === 'Pending' ? 'bg-warning/15 text-warning-light border-warning/30' :
            task.status === 'In Progress' ? 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30 animate-pulse' : 'bg-success/15 text-success-light border-success/30'
          )}>{task.status}</span>
        </div>
        <h3 className="text-[22px] font-black text-white leading-tight mb-2">{task.type}</h3>
      </CardHeader>

      <CardBody className="p-0 flex-1 overflow-y-auto flex flex-col">
        
        {task.specialInstructions && (
          <div className="m-5 bg-emergency/10 border border-emergency/30 rounded-xl p-4 flex items-start gap-3">
             <AlertCircle className="w-5 h-5 text-emergency-light shrink-0 mt-0.5" />
             <div>
               <p className="text-[11px] font-bold text-emergency-light uppercase tracking-widest mb-1">Infection Control Alert</p>
               <p className="text-[13px] text-red-200">{task.specialInstructions}</p>
             </div>
          </div>
        )}

        {/* CHECKLIST (Massive touch targets for gloved hands) */}
        <div className="px-5 pb-5 space-y-3">
           <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-2">Required Steps</p>
           {task.checklist.map(item => {
             const Icon = IconMap[item.iconType] || Sparkles;
             return (
               <div key={item.id} onClick={() => toggleItem({ taskId: task.id, itemId: item.id })}
                 className={cn('p-4 rounded-2xl border-2 flex items-center gap-4 cursor-pointer transition-all active:scale-95',
                   item.isCompleted ? 'bg-success/10 border-success/40 text-success-light' : 'bg-white/[0.03] border-white/10 hover:bg-white/[0.05] text-white'
                 )}>
                 <div className={cn('w-12 h-12 rounded-full flex items-center justify-center shrink-0 transition-colors',
                   item.isCompleted ? 'bg-success/20 text-success-light' : 'bg-white/10 text-gray-400'
                 )}>
                   {item.isCompleted ? <CheckCircle2 className="w-6 h-6" /> : <Icon className="w-6 h-6" />}
                 </div>
                 <span className={cn('text-[16px] font-bold flex-1', item.isCompleted && 'line-through opacity-70')}>{item.label}</span>
               </div>
             )
           })}
        </div>

      </CardBody>

      {/* ACTION BAR */}
      <div className="p-4 border-t border-white/[0.05] bg-black/40">
        {task.status === 'Pending' && (
          <Button onClick={() => updateStatus({ id: task.id, status: 'In Progress' })} className="w-full h-14 text-[14px] font-bold bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 border border-cyan-500/40" leftIcon={<Play className="w-5 h-5" />}>
            Start Cleaning Task
          </Button>
        )}
        {task.status === 'In Progress' && (
          <Button onClick={() => updateStatus({ id: task.id, status: 'Completed' })} disabled={!allCompleted} className={cn('w-full h-14 text-[14px] font-bold border',
            allCompleted ? 'bg-success/20 hover:bg-success/30 text-success-light border-success/40' : 'bg-white/5 text-gray-500 border-white/10 cursor-not-allowed'
          )} leftIcon={<CheckCircle2 className="w-5 h-5" />}>
            {allCompleted ? 'Mark Area Clean & Safe' : 'Complete All Steps First'}
          </Button>
        )}
      </div>
    </Card>
  );
}
