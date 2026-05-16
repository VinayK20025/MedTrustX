'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import type { DispatchAlert } from '../types/ambulance.types';
import { Siren, AlertTriangle, MapPin, Activity } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { dispatch: DispatchAlert | null; }

export function AmbulanceDispatchPanel({ dispatch }: Props) {
  if (!dispatch) {
    return (
      <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col items-center justify-center">
         <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mb-4">
           <Activity className="w-8 h-8 text-success-light" />
         </div>
         <h3 className="text-white font-bold text-lg">Fleet Available</h3>
         <p className="text-gray-400 text-[12px] mt-1">Waiting for dispatch orders...</p>
      </Card>
    );
  }

  return (
    <Card className={cn('shadow-glass h-full flex flex-col border-2 relative overflow-hidden',
      dispatch.priority === 'Critical' ? 'border-emergency bg-emergency/[0.05]' : 'border-warning bg-warning/[0.05]'
    )}>
      {dispatch.priority === 'Critical' && (
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-red-600 via-orange-500 to-red-600 animate-pulse" />
      )}

      <CardHeader className="border-b border-white/[0.04] px-4 py-3 flex justify-between items-center bg-black/20">
        <h3 className={cn('text-[14px] font-black flex items-center gap-2', dispatch.priority === 'Critical' ? 'text-emergency-light' : 'text-warning-light')}>
          <Siren className={cn('w-4 h-4', dispatch.priority === 'Critical' && 'animate-pulse')} /> Active Dispatch
        </h3>
        <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest',
          dispatch.priority === 'Critical' ? 'bg-emergency/20 text-emergency-light animate-pulse' : 'bg-warning/20 text-warning-light'
        )}>{dispatch.priority} Priority</span>
      </CardHeader>

      <CardBody className="p-5 flex-1 overflow-y-auto space-y-6">
        <div className="text-center">
           <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Call Type</span>
           <h4 className="text-[24px] font-black text-white leading-tight mt-1">{dispatch.type} Emergency</h4>
           <p className="text-[12px] text-gray-400 mt-2">Dispatched: {new Date(dispatch.dispatchedAt).toLocaleTimeString()}</p>
        </div>

        <div className="space-y-4 pt-4 border-t border-white/5">
           <div className="bg-black/30 border border-white/10 rounded-xl p-4">
              <p className="text-[10px] uppercase font-bold text-gray-500 tracking-wider mb-2 flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-blue-400" /> Exact Pickup Location</p>
              <p className="text-[16px] font-bold text-white">{dispatch.pickupLocation}</p>
           </div>
           
           <div className="bg-black/30 border border-white/10 rounded-xl p-4">
              <p className="text-[10px] uppercase font-bold text-gray-500 tracking-wider mb-2 flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-emerald-400" /> Hospital Destination</p>
              <p className="text-[16px] font-bold text-white">{dispatch.destination}</p>
           </div>
        </div>

        <div className="flex items-center justify-between bg-black/40 p-4 rounded-xl border border-white/5">
           <div className="text-center flex-1 border-r border-white/10">
             <span className="block text-[10px] text-gray-500 uppercase font-bold mb-1">Distance</span>
             <span className="text-[16px] font-black text-white">{dispatch.distance}</span>
           </div>
           <div className="text-center flex-1">
             <span className="block text-[10px] text-gray-500 uppercase font-bold mb-1">ETA</span>
             <span className={cn('text-[16px] font-black', dispatch.priority === 'Critical' ? 'text-emergency-light' : 'text-white')}>{dispatch.etaToPickup}</span>
           </div>
        </div>
      </CardBody>
    </Card>
  );
}
