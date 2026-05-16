'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { SpeechSession } from '../types/speech.types';
import { useStartSpeechSession, useCompleteSpeechSession } from '../hooks/useSpeechAnalytics';
import { Calendar, Play, CheckCircle2, Clock } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { sessions: SpeechSession[]; }

export function SpeechSessionPanel({ sessions }: Props) {
  const { mutate: startSession, isPending: starting } = useStartSpeechSession();
  const { mutate: completeSession, isPending: completing } = useCompleteSpeechSession();

  return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col">
      <CardHeader className="border-b border-white/[0.04] px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-emerald-500/15"><Calendar className="w-4 h-4 text-emerald-400" /></div>
          <h3 className="text-[15px] font-bold text-white tracking-wide">Today's Sessions</h3>
        </div>
      </CardHeader>

      <CardBody className="p-0 flex-1 overflow-y-auto max-h-[450px]">
        <div className="divide-y divide-white/[0.03]">
          {sessions.map(sess => (
            <div key={sess.id} className={cn('p-5 transition-colors', sess.status === 'In Progress' ? 'bg-emerald-500/5 border-l-2 border-emerald-500' : 'hover:bg-white/[0.015]')}>
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h4 className="text-[13px] font-bold text-white">{sess.patientName}</h4>
                  <p className="text-[11px] text-gray-500 mt-0.5 flex items-center gap-1"><Clock className="w-3 h-3" /> {sess.time} ({sess.durationMinutes} min)</p>
                </div>
                <span className={cn('text-[9px] uppercase font-bold px-2 py-0.5 rounded tracking-wider', 
                  sess.status === 'Scheduled' ? 'bg-blue-500/20 text-blue-400' :
                  sess.status === 'In Progress' ? 'bg-emerald-500/20 text-emerald-400 animate-pulse' : 'bg-success/20 text-success-light'
                )}>
                  {sess.status}
                </span>
              </div>
              
              <div className="bg-surface-dark border border-white/[0.04] p-3 rounded-lg mb-3">
                <p className="text-[11px] font-bold text-gray-300 mb-2">{sess.type}</p>
                <div className="flex flex-wrap gap-2">
                  {sess.activities.map((act, i) => (
                    <span key={i} className="text-[9px] bg-white/5 text-gray-400 px-1.5 py-0.5 rounded border border-white/5">{act}</span>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2">
                {sess.status === 'Scheduled' && (
                  <Button size="xs" onClick={() => startSession(sess.id)} disabled={starting} className="h-7 text-[10px] bg-emerald-600 hover:bg-emerald-500 border-none font-bold" leftIcon={<Play className="w-3 h-3" />}>
                    Start
                  </Button>
                )}
                {sess.status === 'In Progress' && (
                  <Button size="xs" onClick={() => completeSession({ sessionId: sess.id, notes: 'Completed communication drills' })} disabled={completing} className="h-7 text-[10px] bg-success hover:bg-success-light border-none font-bold" leftIcon={<CheckCircle2 className="w-3 h-3" />}>
                    Complete
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
