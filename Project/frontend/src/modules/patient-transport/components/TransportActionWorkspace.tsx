'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { TransportTask } from '../types/patient-transport.types';
import { useUpdateTransportStatus } from '../hooks/usePatientTransportAnalytics';
import { Navigation, Play, CheckCircle2, User, Info, MapPin } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { task?: TransportTask; }

export function TransportActionWorkspace({ task }: Props) {
  const { mutate: updateStatus } = useUpdateTransportStatus();

  if (!task) {
    return (
      <Card className="border-emerald-500/20 shadow-glass bg-[#020504] h-full flex items-center justify-center">
        <div className="text-center opacity-40">
          <Navigation className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
          <p className="text-gray-400 font-bold">Select a transport task from the dispatch queue.</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="border-emerald-500/20 shadow-glass bg-[#020504] h-full flex flex-col relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-emerald-800 via-emerald-500 to-teal-400" />

      <CardHeader className="border-b border-white/[0.04] p-5 pb-4">
        <div className="flex justify-between items-start mb-2">
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Transport Dispatch • {task.id}</span>
          <span className={cn('text-[10px] font-bold px-2 py-1 rounded border uppercase tracking-wider',
            task.status === 'Pending' ? 'bg-warning/15 text-warning-light border-warning/30' :
            task.status === 'In Transit' ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30 animate-pulse' : 'bg-success/15 text-success-light border-success/30'
          )}>{task.status}</span>
        </div>
        <h3 className="text-[22px] font-black text-white leading-tight mb-2">{task.patientName}</h3>
        <p className="text-[12px] font-mono text-gray-400"><User className="w-3.5 h-3.5 inline mr-1" />{task.mrn}</p>
      </CardHeader>

      <CardBody className="p-5 flex-1 overflow-y-auto space-y-6">

        {/* Location Routing */}
        <div className="relative pl-6 space-y-6">
          <div className="absolute left-2.5 top-2 bottom-2 w-0.5 bg-white/10" />
          
          <div className="relative">
            <div className="absolute -left-6 top-0.5 w-3.5 h-3.5 rounded-full bg-blue-500 border-2 border-[#020504]" />
            <p className="text-[10px] font-bold uppercase text-gray-500 tracking-wider mb-1">Pickup Location</p>
            <h4 className="text-[16px] font-bold text-white">{task.fromLocation}</h4>
          </div>

          <div className="relative">
            <div className="absolute -left-6 top-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-[#020504]" />
            <p className="text-[10px] font-bold uppercase text-gray-500 tracking-wider mb-1">Destination</p>
            <h4 className="text-[16px] font-bold text-emerald-400">{task.toLocation}</h4>
          </div>
        </div>

        {/* Requirements & Instructions */}
        <div className="bg-white/[0.02] border border-white/10 rounded-xl p-4">
          <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">Transport Requirements</h4>
          <div className="flex gap-4 text-[12px] text-white">
            <span className="bg-black/40 px-3 py-1.5 rounded border border-white/5">Equipment: <strong className="text-emerald-300">{task.equipment}</strong></span>
          </div>

          {task.specialInstructions && (
            <div className="mt-4 bg-orange-500/10 border border-orange-500/20 rounded p-3 flex items-start gap-2">
              <Info className="w-4 h-4 text-orange-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-[10px] font-bold text-orange-400 uppercase tracking-wider mb-0.5">Special Instructions</p>
                <p className="text-[12px] text-orange-200">{task.specialInstructions}</p>
              </div>
            </div>
          )}
        </div>

      </CardBody>

      {/* ACTION BAR (Mobile Optimized) */}
      <div className="p-4 border-t border-white/[0.05] bg-black/40">
        {task.status === 'Pending' && (
          <Button onClick={() => updateStatus({ id: task.id, status: 'In Transit' })} className="w-full h-14 text-[14px] font-bold bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/40" leftIcon={<Play className="w-5 h-5" />}>
            Accept & Start Transport
          </Button>
        )}
        {task.status === 'In Transit' && (
          <Button onClick={() => updateStatus({ id: task.id, status: 'Completed' })} className="w-full h-14 text-[14px] font-bold bg-success/20 hover:bg-success/30 text-success-light border border-success/40" leftIcon={<CheckCircle2 className="w-5 h-5" />}>
            Confirm Patient Delivered
          </Button>
        )}
      </div>
    </Card>
  );
}
