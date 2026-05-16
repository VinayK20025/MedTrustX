'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { PsychologySession } from '../types/psychology.types';
import { Calendar, Video, Users, Clock } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { sessions: PsychologySession[]; }

export function PsychologySessionPanel({ sessions }: Props) {
  return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col">
      <CardHeader className="border-b border-white/[0.04] px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-sky-500/15"><Calendar className="w-4 h-4 text-sky-400" /></div>
          <h3 className="text-[15px] font-bold text-white tracking-wide">Today's Sessions</h3>
        </div>
      </CardHeader>

      <CardBody className="p-0 flex-1 overflow-y-auto max-h-[450px]">
        <div className="divide-y divide-white/[0.03]">
          {sessions.map(sess => (
            <div key={sess.id} className="p-5 hover:bg-white/[0.015] transition-colors">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h4 className="text-[13px] font-bold text-white">{sess.patientName}</h4>
                  <p className="text-[11px] text-gray-500 mt-0.5 flex items-center gap-1"><Clock className="w-3 h-3" /> {sess.time} ({sess.durationMinutes} min)</p>
                </div>
                <span className={cn('text-[9px] uppercase font-bold px-2 py-0.5 rounded tracking-wider flex items-center gap-1', 
                  sess.status === 'Scheduled' ? 'bg-blue-500/20 text-blue-400' : 'bg-success/20 text-success-light'
                )}>
                  {sess.format === 'Telehealth' ? <Video className="w-2.5 h-2.5"/> : <Users className="w-2.5 h-2.5"/>}
                  {sess.status}
                </span>
              </div>
              
              <div className="bg-surface-dark border border-white/[0.04] p-3 rounded-lg mb-3">
                <p className="text-[11px] font-bold text-gray-300">Type: {sess.type}</p>
                <p className="text-[10px] text-gray-500 mt-1">Format: {sess.format}</p>
              </div>

              <div className="flex justify-end gap-2">
                {sess.status === 'Scheduled' && (
                  <Button size="xs" className="h-7 text-[10px] bg-sky-600 hover:bg-sky-500 border-none font-bold">
                    Join Session
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}
