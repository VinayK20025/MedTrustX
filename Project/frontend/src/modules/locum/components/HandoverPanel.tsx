'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import type { HandoverSummary } from '../types/locum.types';
import { FileText, CheckCircle2, Circle } from 'lucide-react';

interface Props { handover: HandoverSummary; }

export function HandoverPanel({ handover: h }: Props) {
  return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col">
      <CardHeader className="border-b border-white/[0.04] px-5 py-4 flex items-center gap-2">
        <FileText className="w-5 h-5 text-teal-400" />
        <h3 className="text-lg font-semibold text-white tracking-wide">Incoming Handover</h3>
      </CardHeader>
      <CardBody className="p-4 flex-1 space-y-5 overflow-y-auto max-h-[500px]">
        
        <div>
          <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Shift Notes</h4>
          <p className="text-sm text-gray-200 bg-white/[0.02] p-3 rounded-lg border border-white/[0.04] leading-relaxed">
            {h.incomingNotes}
          </p>
        </div>

        {h.warnings.length > 0 && (
          <div>
            <h4 className="text-[10px] font-bold text-emergency-light uppercase tracking-widest mb-2">Shift Warnings</h4>
            <div className="bg-emergency/10 border border-emergency/20 p-3 rounded-lg space-y-1">
              {h.warnings.map((w, i) => (
                <p key={i} className="text-xs text-emergency-light flex gap-2"><span>⚠</span> {w}</p>
              ))}
            </div>
          </div>
        )}

        <div>
          <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Pending Tasks</h4>
          <div className="space-y-2">
            {h.pendingTasks.map(t => (
              <div key={t.id} className="flex items-start gap-3 p-2 bg-white/[0.02] border border-white/[0.04] rounded hover:border-indigo-500/30 transition-colors cursor-pointer">
                <Circle className="w-4 h-4 text-gray-500 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-white">{t.task}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">{t.patientName}</p>
                </div>
                <span className={`ml-auto text-[9px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded ${t.priority === 'high' ? 'bg-warning/20 text-warning-light' : 'bg-white/[0.05] text-gray-400'}`}>
                  {t.priority}
                </span>
              </div>
            ))}
          </div>
        </div>

      </CardBody>
    </Card>
  );
}
