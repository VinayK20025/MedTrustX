'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Clock, Calendar, Scissors } from 'lucide-react';
import type { SurgerySchedule } from '../types/transplant.types';
import { format } from 'date-fns';

export function SurgerySchedulePanel({ surgeries }: { surgeries: SurgerySchedule[] }) {
  return (
    <Card className="h-full border-white/[0.06] bg-surface-dark/50 backdrop-blur-md">
      <CardHeader 
        className="pb-4"
        title="Transplant Operations"
        subtitle="OR scheduling & procurement"
        icon={<Clock className="w-5 h-5" />}
      />
      <CardBody className="p-4 space-y-3 overflow-y-auto max-h-[calc(100%-80px)] custom-scrollbar">
        {surgeries.map((surg) => (
          <div key={surg.id} className="flex flex-col gap-3 p-3 rounded-lg border border-white/[0.06] bg-surface-light hover:border-blue-500/30 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Scissors className="w-4 h-4 text-blue-400" />
                <span className="text-sm font-bold text-white">{surg.id}</span>
              </div>
              <Badge variant="outline" className="text-blue-300 border-blue-500/30">
                {surg.status}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between text-xs text-gray-400">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                <span>{format(new Date(surg.scheduledTime), 'MMM dd, HH:mm')}</span>
              </div>
              <div className="font-mono bg-white/[0.05] px-2 py-0.5 rounded text-gray-300">
                {surg.operatingRoom}
              </div>
            </div>

            <div className="pt-2 border-t border-white/[0.04] flex justify-between text-xs">
              <div>
                <span className="text-gray-500">Match Ref: </span>
                <span className="text-white">{surg.matchId}</span>
              </div>
              <div>
                <span className="text-gray-500">Surgeon: </span>
                <span className="text-white">{surg.surgeonId}</span>
              </div>
            </div>
          </div>
        ))}
      </CardBody>
    </Card>
  );
}
