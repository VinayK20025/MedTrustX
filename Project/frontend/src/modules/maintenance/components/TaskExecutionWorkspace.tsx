'use client';
import React, { useState } from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { MaintenanceTask, MaintenanceLog } from '../types/maintenance.types';
import { useUpdateTask } from '../hooks/useMaintenanceAnalytics';
import { Wrench, Play, CheckCircle2, AlertTriangle, Camera, WifiOff, FileText } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { task?: MaintenanceTask; logs: MaintenanceLog[]; }

export function TaskExecutionWorkspace({ task, logs }: Props) {
  const { mutate: updateTask, isPending } = useUpdateTask();
  const [notes, setNotes] = useState('');

  if (!task) return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col items-center justify-center">
      <Wrench className="w-10 h-10 text-gray-600 mb-4" />
      <p className="text-gray-500 text-[15px]">Select a task to begin</p>
    </Card>
  );

  return (
    <Card className="border-blue-500/25 shadow-glass bg-[#050b14] h-full flex flex-col relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-600 to-indigo-500" />

      <CardHeader className="border-b border-white/[0.04] px-5 py-4">
        <div className="flex justify-between items-start mb-2">
          <span className="text-[11px] text-gray-500 font-mono">{task.workOrderId}</span>
          {task.isOfflineSyncPending && <span className="text-[10px] bg-warning/20 text-warning-light px-2 py-0.5 rounded font-bold flex items-center gap-1"><WifiOff className="w-3 h-3" /> Offline Sync Pending</span>}
        </div>
        <h3 className="text-[18px] font-bold text-white mb-1">{task.title}</h3>
        <p className="text-[13px] text-gray-400">{task.assetName}</p>
      </CardHeader>

      <CardBody className="p-0 flex-1 overflow-y-auto flex flex-col">
        {/* Task Details */}
        <div className="p-5 border-b border-white/5 space-y-4">
          <div>
            <h4 className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Description</h4>
            <p className="text-[13px] text-gray-200 leading-relaxed bg-white/5 p-3 rounded-lg border border-white/10">{task.description}</p>
          </div>
          <div>
            <h4 className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Location</h4>
            <p className="text-[14px] font-bold text-blue-300 bg-blue-500/10 p-3 rounded-lg border border-blue-500/20">{task.location}</p>
          </div>
        </div>

        {/* Execution & Logs */}
        <div className="p-5 flex-1 flex flex-col gap-4">
          <div className="flex-1">
             <h4 className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-3 border-b border-white/5 pb-2">Activity Log</h4>
             <div className="space-y-3">
               {logs.map(log => (
                 <div key={log.id} className="text-[11px]">
                   <span className="text-gray-500 font-mono mr-2">{new Date(log.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                   <span className="text-gray-300">{log.action}</span>
                 </div>
               ))}
             </div>
          </div>
          
          {/* Quick Update */}
          <div className="mt-auto pt-4">
             <textarea 
               placeholder="Add maintenance notes here..." 
               className="w-full h-20 bg-black/40 border border-white/10 rounded-lg p-3 text-[13px] text-white focus:outline-none focus:border-blue-500/50 resize-none mb-3"
               value={notes}
               onChange={(e) => setNotes(e.target.value)}
             />
             <div className="grid grid-cols-2 gap-3">
               <Button className="h-12 bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 text-[13px] font-bold" leftIcon={<Camera className="w-4 h-4" />}>Add Photo</Button>
               {task.status === 'Assigned' ? (
                 <Button disabled={isPending} onClick={() => updateTask({ id: task.id, status: 'In Progress', notes })} className="h-12 bg-blue-600 hover:bg-blue-500 text-white text-[13px] font-bold" leftIcon={<Play className="w-4 h-4" />}>Start Task</Button>
               ) : (
                 <Button disabled={isPending} onClick={() => updateTask({ id: task.id, status: 'Completed', notes })} className="h-12 bg-success hover:bg-success-light/90 text-white text-[13px] font-bold" leftIcon={<CheckCircle2 className="w-4 h-4" />}>Mark Complete</Button>
               )}
             </div>
             {task.status === 'In Progress' && (
               <Button disabled={isPending} onClick={() => updateTask({ id: task.id, status: 'Blocked', notes })} className="w-full h-12 mt-3 bg-emergency/10 hover:bg-emergency/20 border border-emergency/30 text-emergency-light text-[13px] font-bold" leftIcon={<AlertTriangle className="w-4 h-4" />}>Report Issue / Blocked</Button>
             )}
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
