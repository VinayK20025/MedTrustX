'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { QueuedPatient } from '../types/telemedicine.types';
import { useStartConsultation } from '../hooks/useTelemedicineAnalytics';
import { Users, Video, Wifi, WifiOff, AlertTriangle } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { queue: QueuedPatient[]; selectedId?: string; onSelect: (id: string) => void; }

const connColor: Record<string, string> = { Good: 'text-success-light', Fair: 'text-warning-light', Poor: 'text-emergency-light' };

export function PatientQueuePanel({ queue, selectedId, onSelect }: Props) {
  const { mutate: startConsult } = useStartConsultation();
  const waiting = queue.filter(p => p.status === 'Waiting');
  const inConsult = queue.find(p => p.status === 'In Consult');

  return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col">
      <CardHeader className="border-b border-white/[0.04] px-4 py-3 flex justify-between items-center">
        <h3 className="text-[14px] font-bold text-white flex items-center gap-2">
          <Users className="w-4 h-4 text-sky-400" /> Patient Queue
        </h3>
        <span className="text-[10px] font-bold bg-white/10 px-2 py-0.5 rounded-full">{waiting.length} Waiting</span>
      </CardHeader>

      <CardBody className="p-0 flex-1 overflow-y-auto">
        {/* Active Consultation */}
        {inConsult && (
          <div className="px-3 pt-3 pb-1">
            <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest">Active Consultation</span>
          </div>
        )}
        {inConsult && (
          <div onClick={() => onSelect(inConsult.id)}
            className={cn('p-4 border-l-4 border-emerald-500 bg-emerald-500/[0.06] cursor-pointer',
              selectedId === inConsult.id && 'ring-1 ring-inset ring-white/15'
            )}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-mono text-gray-400">{inConsult.id}</span>
              <span className="text-[9px] font-bold bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded flex items-center gap-1 animate-pulse"><Video className="w-2.5 h-2.5" /> LIVE</span>
            </div>
            <h4 className="text-[14px] font-bold text-white">{inConsult.name}</h4>
            <p className="text-[11px] text-gray-400 mt-0.5">{inConsult.age}y {inConsult.gender} • {inConsult.complaint}</p>
            {inConsult.allergies && inConsult.allergies.length > 0 && (
              <div className="flex items-center gap-1 mt-2 text-[10px] text-emergency-light font-bold"><AlertTriangle className="w-3 h-3" /> Allergy: {inConsult.allergies.join(', ')}</div>
            )}
          </div>
        )}

        {/* Waiting Queue */}
        {waiting.length > 0 && (
          <div className="px-3 pt-3 pb-1 border-t border-white/5">
            <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Up Next</span>
          </div>
        )}
        <div className="divide-y divide-white/[0.03]">
          {waiting.map(p => (
            <div key={p.id} onClick={() => onSelect(p.id)}
              className={cn('p-4 cursor-pointer transition-all border-l-4 border-sky-500 bg-sky-500/[0.03]',
                selectedId === p.id ? 'ring-1 ring-inset ring-white/15 bg-white/[0.06]' : 'hover:bg-white/[0.06]'
              )}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-mono text-gray-400">{p.id}</span>
                <span className={cn('text-[9px] font-bold flex items-center gap-1', connColor[p.connectionQuality])}>
                  {p.connectionQuality === 'Poor' ? <WifiOff className="w-2.5 h-2.5" /> : <Wifi className="w-2.5 h-2.5" />}
                  {p.connectionQuality}
                </span>
              </div>
              <h4 className="text-[13px] font-bold text-white">{p.name}</h4>
              <p className="text-[11px] text-gray-400 mt-0.5 truncate">{p.complaint}</p>
              <div className="flex justify-between items-center text-[10px] mt-2 pt-2 border-t border-white/5">
                <span className="text-gray-500">{new Date(p.scheduledTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                <Button onClick={(e) => { e.stopPropagation(); startConsult(p.id); }} size="sm" className="bg-sky-500/20 text-sky-400 border-sky-500/40 hover:bg-sky-500/30 text-[10px] h-7" leftIcon={<Video className="w-3 h-3" />}>Start Call</Button>
              </div>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}
