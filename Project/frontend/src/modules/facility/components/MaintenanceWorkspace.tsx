'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { WorkOrder } from '../types/facility.types';
import { Wrench, AlertTriangle, Clock, MapPin, ArrowRight } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { workOrders: WorkOrder[]; }

const priorityColor: Record<string, string> = {
  Emergency: 'bg-emergency/20 text-emergency-light border border-emergency/30',
  High: 'bg-orange-500/20 text-orange-400 border border-orange-500/30',
  Routine: 'bg-gray-500/20 text-gray-300',
};

const PIPELINE = ['Reported', 'Assigned', 'In Progress', 'Completed'];

export function MaintenanceWorkspace({ workOrders }: Props) {
  if (workOrders.length === 0) return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col items-center justify-center">
      <Wrench className="w-8 h-8 text-gray-600 mb-3" />
      <p className="text-gray-500 text-[13px]">No active work orders for selected asset</p>
    </Card>
  );

  return (
    <Card className="border-emerald-500/25 shadow-glass bg-[#020a06] h-full flex flex-col relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-600" />

      <CardHeader className="border-b border-white/[0.04] px-5 py-4">
        <h3 className="text-[16px] font-bold text-white flex items-center gap-2"><Wrench className="w-4 h-4 text-emerald-400" /> Maintenance Workspace</h3>
        <p className="text-[11px] text-gray-500 mt-1 font-mono">Manage active work orders and maintenance dispatches.</p>
      </CardHeader>

      <CardBody className="p-5 flex-1 overflow-y-auto">
        <div className="flex flex-col gap-5">
          {workOrders.map((wo) => {
            const ci = PIPELINE.indexOf(wo.status);
            return (
              <div key={wo.id} className={cn("p-4 rounded-xl border relative transition-all", wo.priority === 'Emergency' ? "bg-emergency/[0.03] border-emergency/30" : "bg-white/[0.02] border-white/5")}>
                
                {/* Header */}
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="text-[13px] font-bold text-white">{wo.assetName}</h4>
                    <p className="text-[10px] text-gray-400 font-mono mt-0.5 flex items-center gap-1"><MapPin className="w-2.5 h-2.5" /> {wo.location} • {wo.id}</p>
                  </div>
                  <span className={cn('text-[9px] uppercase font-bold px-2 py-0.5 rounded tracking-wider', priorityColor[wo.priority])}>{wo.priority}</span>
                </div>

                {/* Description & Alert */}
                {wo.priority === 'Emergency' && (
                  <div className="mb-3 bg-emergency/10 border border-emergency/20 rounded p-2 text-[11px] text-emergency-light flex items-center gap-1.5 font-bold">
                    <AlertTriangle className="w-3.5 h-3.5" /> Immediate Dispatch Required
                  </div>
                )}
                <p className="text-[11px] text-gray-300 leading-relaxed bg-black/30 p-2 rounded border border-white/5">{wo.issueDescription}</p>

                {/* Status Pipeline */}
                <div className="mt-4 pt-4 border-t border-white/5">
                  <div className="flex items-center justify-between">
                    {PIPELINE.map((stage, i) => (
                      <React.Fragment key={stage}>
                        <div className={cn("text-[9px] font-bold tracking-wider uppercase", i <= ci ? "text-emerald-400" : "text-gray-600")}>{stage}</div>
                        {i < PIPELINE.length - 1 && <ArrowRight className={cn("w-3 h-3", i < ci ? "text-emerald-500" : "text-gray-700")} />}
                      </React.Fragment>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-4 flex justify-between items-center">
                  <span className="text-[10px] text-gray-500 font-mono flex items-center gap-1"><Clock className="w-3 h-3" /> Reported: {new Date(wo.reportedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                  <div className="flex gap-2">
                    {wo.status === 'Reported' && <Button size="sm" className="h-8 text-[11px] bg-blue-600 hover:bg-blue-500 text-white font-bold">Assign Tech</Button>}
                    {wo.status === 'Assigned' && <Button size="sm" className="h-8 text-[11px] bg-amber-600 hover:bg-amber-500 text-white font-bold">Start Work</Button>}
                    {wo.status === 'In Progress' && <Button size="sm" className="h-8 text-[11px] bg-success hover:bg-success-light/90 text-white font-bold">Mark Complete</Button>}
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      </CardBody>
    </Card>
  );
}
