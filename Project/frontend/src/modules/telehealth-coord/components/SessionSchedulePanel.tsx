'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { TelehealthSession } from '../types/telehealth-coord.types';
import { useNotifyDoctor, useRescheduleSession } from '../hooks/useTelehealthCoordAnalytics';
import { CalendarClock, Video, Bell, RefreshCw, AlertTriangle, CheckCircle2, XCircle, Clock, UserCheck } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { sessions: TelehealthSession[]; selectedId?: string; onSelect: (id: string) => void; }

const statusStyle: Record<string, { border: string; icon: React.ReactNode; color: string }> = {
  'In Progress': { border: 'border-emerald-500 bg-emerald-500/[0.04]', icon: <Video className="w-3 h-3" />, color: 'text-emerald-400' },
  'Patient Waiting': { border: 'border-warning bg-warning/[0.04]', icon: <Clock className="w-3 h-3" />, color: 'text-warning-light' },
  'Scheduled': { border: 'border-blue-500 bg-blue-500/[0.04]', icon: <CalendarClock className="w-3 h-3" />, color: 'text-blue-400' },
  'Completed': { border: 'border-gray-500 bg-gray-500/[0.04]', icon: <CheckCircle2 className="w-3 h-3" />, color: 'text-gray-400' },
  'No Show': { border: 'border-emergency bg-emergency/[0.04]', icon: <XCircle className="w-3 h-3" />, color: 'text-emergency-light' },
};

export function SessionSchedulePanel({ sessions, selectedId, onSelect }: Props) {
  const { mutate: notifyDoc } = useNotifyDoctor();
  const { mutate: reschedule } = useRescheduleSession();

  const live = sessions.filter(s => s.status === 'In Progress');
  const waiting = sessions.filter(s => s.status === 'Patient Waiting');
  const upcoming = sessions.filter(s => s.status === 'Scheduled');
  const other = sessions.filter(s => s.status === 'Completed' || s.status === 'No Show');

  const renderSection = (title: string, items: TelehealthSession[], highlight?: boolean) => {
    if (items.length === 0) return null;
    return (
      <>
        <div className={cn('px-3 pt-3 pb-1', highlight && 'bg-emerald-500/5')}>
          <span className={cn('text-[9px] font-bold uppercase tracking-widest', highlight ? 'text-emerald-400' : 'text-gray-500')}>{title}</span>
        </div>
        {items.map(s => {
          const style = statusStyle[s.status];
          return (
            <div key={s.id} onClick={() => onSelect(s.id)}
              className={cn('p-3 cursor-pointer transition-all border-l-4',
                style.border,
                selectedId === s.id ? 'ring-1 ring-inset ring-white/15 bg-white/[0.06]' : 'hover:bg-white/[0.06]'
              )}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-mono text-gray-400">{s.id}</span>
                <span className={cn('text-[9px] font-bold uppercase tracking-wider flex items-center gap-1', style.color)}>
                  {style.icon} {s.status}
                </span>
              </div>
              <div className="flex items-center gap-2 mb-0.5">
                <h4 className="text-[13px] font-bold text-white">{s.patientName}</h4>
              </div>
              <p className="text-[10px] text-gray-400">{s.doctorName} • {s.specialty}</p>
              <div className="flex justify-between items-center text-[10px] mt-2 pt-2 border-t border-white/5">
                <span className="text-gray-500">{new Date(s.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                {s.status === 'Patient Waiting' && (
                  <Button onClick={(e) => { e.stopPropagation(); notifyDoc(s.id); }} size="sm" className="bg-warning/10 text-warning-light border-warning/30 text-[9px] h-6 hover:bg-warning/20" leftIcon={<Bell className="w-2.5 h-2.5" />}>Notify Dr</Button>
                )}
                {s.status === 'No Show' && (
                  <Button onClick={(e) => { e.stopPropagation(); reschedule(s.id); }} size="sm" className="bg-blue-500/10 text-blue-400 border-blue-500/30 text-[9px] h-6 hover:bg-blue-500/20" leftIcon={<RefreshCw className="w-2.5 h-2.5" />}>Reschedule</Button>
                )}
                {s.status === 'In Progress' && s.duration && (
                  <span className="text-emerald-400 font-mono font-bold">{s.duration}m</span>
                )}
              </div>
            </div>
          );
        })}
      </>
    );
  };

  return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col">
      <CardHeader className="border-b border-white/[0.04] px-4 py-3 flex justify-between items-center">
        <h3 className="text-[14px] font-bold text-white flex items-center gap-2">
          <CalendarClock className="w-4 h-4 text-cyan-400" /> Session Schedule
        </h3>
        <span className="text-[10px] font-bold bg-white/10 px-2 py-0.5 rounded-full">{sessions.length} Total</span>
      </CardHeader>

      <CardBody className="p-0 flex-1 overflow-y-auto divide-y divide-white/[0.03]">
        {renderSection('Live Now', live, true)}
        {renderSection('Patient Waiting', waiting)}
        {renderSection('Upcoming', upcoming)}
        {renderSection('Past', other)}
      </CardBody>
    </Card>
  );
}
