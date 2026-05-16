'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { ElectricalTask } from '../types/electrician.types';
import { useUpdateElectTask, useCompleteSafetyCheck } from '../hooks/useElectricianAnalytics';
import { Zap, ShieldAlert, CheckCircle2, AlertTriangle, PowerOff } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { task?: ElectricalTask; }

export function ElectricalTaskWorkspace({ task }: Props) {
  const { mutate: updateTask, isPending: updating } = useUpdateElectTask();
  const { mutate: completeSafety, isPending: safetying } = useCompleteSafetyCheck();

  if (!task) return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col items-center justify-center">
      <Zap className="w-10 h-10 text-gray-600 mb-4" />
      <p className="text-gray-500 text-[15px]">Select an electrical task</p>
    </Card>
  );

  return (
    <Card className={cn("shadow-glass h-full flex flex-col relative overflow-hidden", task.isEmergency ? "bg-[#1a0505] border-emergency/30" : "bg-[#0a0a05] border-yellow-500/25")}>
      <div className={cn("absolute top-0 left-0 w-full h-1.5", task.isEmergency ? "bg-gradient-to-r from-red-600 to-emergency-500" : "bg-gradient-to-r from-yellow-600 to-orange-500")} />

      <CardHeader className="border-b border-white/[0.04] px-5 py-4">
        {task.isEmergency && (
           <div className="mb-3 bg-emergency/20 border border-emergency/30 text-emergency-light p-2 rounded text-[11px] font-bold flex items-center justify-center gap-2 animate-pulse">
             <AlertTriangle className="w-4 h-4" /> CRITICAL EMERGENCY TASK ACTIVATED
           </div>
        )}
        <h3 className="text-[18px] font-bold text-white mb-1">{task.title}</h3>
        <p className="text-[13px] text-gray-400">{task.system} • {task.location}</p>
      </CardHeader>

      <CardBody className="p-0 flex-1 overflow-y-auto flex flex-col">
        <div className="p-5 border-b border-white/5">
          <h4 className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Issue Details</h4>
          <p className="text-[13px] text-gray-200 leading-relaxed bg-white/5 p-3 rounded-lg border border-white/10">{task.description}</p>
        </div>

        <div className="p-5 flex-1 flex flex-col gap-4">
          {/* SAFETY CHECKLIST - CRITICAL BEFORE STARTING */}
          <div className={cn("rounded-xl border p-4", task.safetyChecklistCompleted ? "bg-success/5 border-success/20" : "bg-warning/10 border-warning/30")}>
             <h4 className={cn("text-[12px] font-bold uppercase tracking-widest mb-3 flex items-center gap-1.5", task.safetyChecklistCompleted ? "text-success-light" : "text-warning-light")}>
               <ShieldAlert className="w-4 h-4" /> LOTO Safety Protocol
             </h4>
             
             {!task.safetyChecklistCompleted ? (
               <>
                 <p className="text-[11px] text-gray-300 mb-4">You must confirm the following before commencing work on {task.system}:</p>
                 <div className="space-y-2 mb-4">
                   <label className="flex items-center gap-3 text-[12px] text-gray-300"><input type="checkbox" className="w-4 h-4 accent-yellow-500" /> Circuit breaker isolated and locked out</label>
                   <label className="flex items-center gap-3 text-[12px] text-gray-300"><input type="checkbox" className="w-4 h-4 accent-yellow-500" /> Voltage verified as zero with multimeter</label>
                   <label className="flex items-center gap-3 text-[12px] text-gray-300"><input type="checkbox" className="w-4 h-4 accent-yellow-500" /> Arc flash PPE equipped</label>
                 </div>
                 <Button disabled={safetying} onClick={() => completeSafety(task.id)} className="w-full h-10 bg-warning/20 hover:bg-warning/30 text-warning-light border border-warning/30 text-[12px] font-bold" leftIcon={<CheckCircle2 className="w-4 h-4" />}>Acknowledge Safety Clearance</Button>
               </>
             ) : (
               <div className="text-[12px] text-success-light font-bold flex items-center gap-2 bg-success/10 p-2 rounded">
                 <CheckCircle2 className="w-4 h-4" /> Safety protocol cleared. Safe to proceed.
               </div>
             )}
          </div>
          
          <div className="mt-auto pt-4 grid grid-cols-2 gap-3">
             <Button disabled={!task.safetyChecklistCompleted || task.status === 'In Progress' || updating} 
               onClick={() => updateTask({ id: task.id, payload: { status: 'In Progress' } })} 
               className={cn("h-12 text-[13px] font-bold", task.safetyChecklistCompleted && task.status !== 'In Progress' ? "bg-yellow-600 hover:bg-yellow-500 text-black" : "bg-gray-700 text-gray-500")} leftIcon={<PowerOff className="w-4 h-4" />}>
               Commence Work
             </Button>
             <Button disabled={task.status !== 'In Progress' || updating} 
               onClick={() => updateTask({ id: task.id, payload: { status: 'Resolved' } })} 
               className={cn("h-12 text-[13px] font-bold", task.status === 'In Progress' ? "bg-success hover:bg-success-light/90 text-white" : "bg-gray-700 text-gray-500")} leftIcon={<CheckCircle2 className="w-4 h-4" />}>
               Resolve Fault
             </Button>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
