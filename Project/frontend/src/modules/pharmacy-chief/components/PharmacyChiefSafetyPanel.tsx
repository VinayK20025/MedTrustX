'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { AdverseDrugEvent } from '../types/pharmacyChief.types';
import { ShieldAlert, Stethoscope } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { events: AdverseDrugEvent[]; }

export function PharmacyChiefSafetyPanel({ events }: Props) {
  return (
    <Card className="border-emergency/30 shadow-glass bg-[#0a0505] h-full flex flex-col relative overflow-hidden">
      <div className="absolute top-0 left-0 w-1 h-full bg-emergency" />
      <CardHeader className="border-b border-emergency/20 px-5 py-4 flex items-center justify-between bg-emergency/5">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-emergency-light" />
          <h3 className="text-[13px] font-bold tracking-widest text-emergency-light">ADVERSE DRUG EVENTS (ADE)</h3>
        </div>
      </CardHeader>

      <CardBody className="p-0 flex-1 overflow-y-auto">
        <div className="divide-y divide-emergency/10">
          {events.map(event => (
            <div key={event.id} className="p-5 hover:bg-white/[0.015] transition-colors">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="text-[14px] font-bold text-white flex items-center gap-2">
                    {event.drugName}
                    <span className="text-[9px] uppercase font-bold bg-emergency/20 text-emergency-light px-1.5 py-0.5 rounded">{event.severity}</span>
                  </h4>
                  <p className="text-[11px] text-gray-300 mt-1">Reaction: {event.reactionType}</p>
                </div>
                <span className="text-[10px] font-bold px-2 py-1 rounded border bg-warning/10 border-warning/30 text-warning-light">
                  {event.status}
                </span>
              </div>

              <div className="bg-black/40 p-3 rounded mt-3 border border-white/5">
                <div className="flex justify-between items-center text-[10px] font-mono text-gray-500">
                  <span className="flex items-center gap-1"><Stethoscope className="w-3 h-3"/> {event.reportedBy}</span>
                  <span>PT: {event.patientId}</span>
                </div>
              </div>

              {event.status === 'Investigating' && (
                <div className="mt-4 flex gap-2">
                   <Button size="sm" className="bg-surface-dark border border-white/10 hover:bg-white/5 text-[10px] h-7">View Patient Chart</Button>
                   <Button size="sm" className="bg-emergency hover:bg-emergency-600 text-white font-bold border-none text-[10px] h-7">Report to Regulator</Button>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}
