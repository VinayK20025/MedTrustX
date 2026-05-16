'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import type { TimelineEntry } from '../types/doctor.types';
import { Clock, Stethoscope, Pill, FlaskConical, Scissors, FileText, AlertTriangle } from 'lucide-react';

interface Props { entries: TimelineEntry[]; }

const typeConfig: Record<string, { icon: any; color: string; bg: string }> = {
  consultation: { icon: Stethoscope, color: 'text-teal-400', bg: 'bg-teal-500/10 border-teal-500/20' },
  medication:   { icon: Pill, color: 'text-indigo-400', bg: 'bg-indigo-500/10 border-indigo-500/20' },
  lab:          { icon: FlaskConical, color: 'text-warning-light', bg: 'bg-warning/10 border-warning/20' },
  procedure:    { icon: Scissors, color: 'text-success-light', bg: 'bg-success/10 border-success/20' },
  note:         { icon: FileText, color: 'text-gray-400', bg: 'bg-white/5 border-white/10' },
  vitals_alert: { icon: AlertTriangle, color: 'text-emergency-light', bg: 'bg-emergency/10 border-emergency/20' },
};

export function TimelinePanel({ entries }: Props) {
  return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col">
      <CardHeader className="border-b border-white/[0.04] px-5 py-4 flex items-center gap-2">
        <Clock className="w-5 h-5 text-gray-400" />
        <div>
          <h3 className="text-lg font-semibold text-white tracking-wide">Clinical Timeline</h3>
          <p className="text-xs text-gray-400 mt-0.5">Recent activity across patients</p>
        </div>
      </CardHeader>
      <CardBody className="p-4 flex-1 overflow-y-auto max-h-[450px]">
        <div className="relative">
          <div className="absolute left-3 top-0 bottom-0 w-px bg-white/[0.06]" />
          <div className="space-y-4">
            {entries.map(e => {
              const cfg = typeConfig[e.type];
              const Icon = cfg.icon;
              return (
                <div key={e.id} className="relative pl-8">
                  <div className={`absolute left-1.5 top-1 w-3 h-3 rounded-full border ${cfg.bg} flex items-center justify-center`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${cfg.color.replace('text-', 'bg-')}`} />
                  </div>
                  <div className="p-3 bg-white/[0.02] border border-white/[0.04] rounded-xl hover:border-white/[0.08] transition-colors">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <Icon className={`w-3.5 h-3.5 ${cfg.color}`} />
                      <span className="text-xs font-semibold text-white">{e.title}</span>
                      <span className="text-[10px] text-gray-500 ml-auto">{e.actor}</span>
                    </div>
                    <p className="text-[11px] text-gray-300 leading-relaxed">{e.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
