'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { TriagePatient, TriagePriority } from '../types/emergency-coord.types';
import { useAssignTriage } from '../hooks/useEcAnalytics';
import { Ambulance, Clock, AlertTriangle, User } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { patients: TriagePatient[]; selectedId?: string; onSelect: (id: string) => void; }

const priorityConfig: Record<TriagePriority, { bg: string; badge: string; dot: string; label: string }> = {
  Red:    { bg: 'border-l-red-600 bg-emergency/[0.04] hover:bg-emergency/[0.08]', badge: 'bg-red-900/50 text-red-300 border-red-700/50',   dot: 'bg-red-500 animate-ping', label: 'Immediate' },
  Yellow: { bg: 'border-l-yellow-500 hover:bg-yellow-500/[0.03]',                  badge: 'bg-yellow-900/40 text-yellow-300 border-yellow-700/40', dot: 'bg-yellow-400 animate-pulse', label: 'Delayed' },
  Green:  { bg: 'border-l-emerald-600 hover:bg-emerald-500/[0.02]',                badge: 'bg-emerald-900/30 text-emerald-300 border-emerald-700/30', dot: 'bg-emerald-400', label: 'Minor' },
  Black:  { bg: 'border-l-gray-600 opacity-60',                                    badge: 'bg-gray-800 text-gray-400 border-gray-700',          dot: 'bg-gray-600', label: 'Expectant' },
};

const statusColor: Record<string, string> = {
  Incoming: 'bg-blue-500/20 text-blue-300', Triaging: 'bg-yellow-500/20 text-yellow-300 animate-pulse',
  Routing: 'bg-orange-500/20 text-orange-300', Allocated: 'bg-success/20 text-success-light', Treated: 'bg-gray-500/20 text-gray-400',
};

export function TriageQueuePanel({ patients, selectedId, onSelect }: Props) {
  const redCount = patients.filter(p => p.priority === 'Red' && p.status !== 'Treated').length;

  // Sort: Red → Yellow → Green → Black
  const priorityOrder: Record<TriagePriority, number> = { Red: 0, Yellow: 1, Green: 2, Black: 3 };
  const sorted = [...patients].sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col">
      <CardHeader className="border-b border-white/[0.04] px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded bg-red-500/15"><AlertTriangle className="w-4 h-4 text-red-400" /></div>
          <h3 className="text-[14px] font-bold text-white">Triage Queue</h3>
        </div>
        <span className="text-[10px] bg-emergency/20 text-emergency-light px-2 py-0.5 rounded font-bold border border-emergency/30 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emergency-light animate-ping inline-block" />
          {redCount} Red
        </span>
      </CardHeader>

      <CardBody className="p-0 flex-1 overflow-y-auto">
        <div className="divide-y divide-white/[0.03]">
          {sorted.map(p => {
            const cfg = priorityConfig[p.priority];
            return (
              <div key={p.id} onClick={() => onSelect(p.id)}
                className={cn('p-3.5 cursor-pointer border-l-4 transition-all group relative',
                  cfg.bg,
                  selectedId === p.id ? 'ring-1 ring-inset ring-white/15 bg-white/[0.06]' : ''
                )}>
                {/* Priority tag row */}
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <div className="relative shrink-0">
                      <div className={cn('w-2 h-2 rounded-full', cfg.dot)} />
                    </div>
                    <span className="text-[10px] font-black text-white font-mono">{p.tag}</span>
                    <span className={cn('text-[9px] font-bold uppercase px-1.5 py-0.5 rounded border tracking-wider', cfg.badge)}>{p.priority} — {cfg.label}</span>
                  </div>
                  <span className={cn('text-[9px] font-bold px-1.5 py-0.5 rounded', statusColor[p.status])}>{p.status}</span>
                </div>

                {/* Complaint */}
                <p className="text-[12px] text-gray-200 font-medium truncate">{p.chiefComplaint}</p>

                {/* From → To + ETA */}
                <div className="flex items-center justify-between mt-1.5 text-[10px]">
                  <span className="text-gray-400 flex items-center gap-1">
                    <Ambulance className="w-3 h-3 shrink-0 text-gray-500" />
                    {p.from}
                    {p.routedTo && <span className="text-blue-300 ml-1">→ {p.routedTo}</span>}
                  </span>
                  {p.eta !== undefined ? (
                    <span className="text-blue-300 font-mono flex items-center gap-0.5"><Clock className="w-3 h-3" /> ETA {p.eta}m</span>
                  ) : (
                    p.arrivedAt && <span className="text-gray-600 font-mono">{new Date(p.arrivedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardBody>
    </Card>
  );
}
