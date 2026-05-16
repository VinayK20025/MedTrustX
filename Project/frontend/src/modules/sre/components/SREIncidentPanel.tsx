'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import type { SREIncident, SREService } from '../types/sre.types';
import { ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface Props { 
  incidents: SREIncident[];
  services: SREService[];
}

export function SREIncidentPanel({ incidents, services }: Props) {
  const getServiceName = (id: string) => services.find(s => s.id === id)?.name || id;

  if (incidents.length === 0) {
    return (
      <Card className="border-success/20 shadow-glass bg-surface-light h-full flex flex-col items-center justify-center p-6 text-center">
        <ShieldAlert className="w-10 h-10 text-success-light mb-3 opacity-50" />
        <h3 className="text-white font-bold">No Active Incidents</h3>
        <p className="text-gray-400 text-sm mt-1">All services operating normally.</p>
      </Card>
    );
  }

  return (
    <Card className="border-emergency/40 shadow-glass bg-surface-light h-full flex flex-col">
      <CardHeader className="border-b border-emergency/20 px-5 py-4 flex items-center justify-between bg-emergency/5">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-emergency-light" />
          <h3 className="text-[15px] font-bold text-emergency-light tracking-wide">Active Incidents</h3>
        </div>
      </CardHeader>
      <CardBody className="p-4 flex-1 space-y-3 overflow-y-auto">
        {incidents.map(inc => (
          <div key={inc.id} className="p-4 rounded-xl border border-emergency/30 bg-emergency/10 flex flex-col gap-3">
             <div className="flex justify-between items-start">
               <div>
                 <span className="text-sm font-bold text-white block">{inc.id}: {inc.title}</span>
                 <span className="text-[12px] text-gray-300 mt-1 block">Impacted: <span className="font-bold">{getServiceName(inc.serviceId)}</span></span>
               </div>
               <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded tracking-widest ${
                 inc.status === 'open' ? 'bg-emergency/20 text-emergency-light' : 
                 inc.status === 'investigating' ? 'bg-warning/20 text-warning-light' : 
                 'bg-success/20 text-success-light'
               }`}>
                 {inc.status}
               </span>
             </div>
             
             <div className="flex justify-between items-center mt-2 pt-3 border-t border-emergency/20">
               <span className="text-[11px] text-gray-400 font-mono">{new Date(inc.createdAt).toLocaleTimeString()}</span>
               <Button size="sm" className="bg-emergency hover:bg-emergency-light border-none text-white">Open Runbook</Button>
             </div>
          </div>
        ))}
      </CardBody>
    </Card>
  );
}
