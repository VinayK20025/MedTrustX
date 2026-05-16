'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { SafetyIncident } from '../types/med-director.types';
import { ShieldAlert, ArrowUpRight } from 'lucide-react';
import { useEscalateIncident } from '../hooks/useMedDirectorAnalytics';

interface Props { incidents: SafetyIncident[]; }

const severityStyle: Record<string, string> = {
  sentinel:  'bg-emergency text-white animate-pulse',
  serious:   'bg-emergency/20 text-emergency-light border border-emergency/30',
  moderate:  'bg-warning/20 text-warning-light border border-warning/30',
  near_miss: 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30',
};

const typeLabel: Record<string, string> = {
  medication_error: 'Medication', fall: 'Fall', infection: 'Infection',
  surgical: 'Surgical', diagnostic: 'Diagnostic', other: 'Other',
};

const statusStyle: Record<string, string> = {
  open:          'text-emergency-light',
  investigating: 'text-warning-light',
  rca_pending:   'text-indigo-300',
  resolved:      'text-success-light',
};

export function SafetyPanel({ incidents }: Props) {
  const { mutate: escalate, isPending } = useEscalateIncident();

  return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col">
      <CardHeader className="border-b border-white/[0.04] px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-emergency-light" />
          <div>
            <h3 className="text-lg font-semibold text-white tracking-wide">Patient Safety</h3>
            <p className="text-xs text-gray-400 mt-0.5">Incident tracking & root cause analysis</p>
          </div>
        </div>
        <span className="text-xs text-emergency-light bg-emergency/10 px-2 py-1 rounded-full border border-emergency/20 font-bold">
          {incidents.filter(i => i.status !== 'resolved').length} open
        </span>
      </CardHeader>
      <CardBody className="p-0 flex-1 overflow-y-auto max-h-[420px]">
        <div className="divide-y divide-white/[0.04]">
          {incidents.map(inc => (
            <div key={inc.id} className="p-4 hover:bg-white/[0.02] transition-colors group">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded ${severityStyle[inc.severity]}`}>{inc.severity.replace('_', ' ')}</span>
                <span className="text-[10px] text-teal-300 bg-teal-500/10 px-1.5 py-0.5 rounded">{typeLabel[inc.type]}</span>
                <span className={`text-[10px] ml-auto font-bold uppercase tracking-wider ${statusStyle[inc.status]}`}>● {inc.status.replace('_', ' ')}</span>
              </div>
              <h4 className="text-sm font-semibold text-white mb-1">{inc.title}</h4>
              <p className="text-xs text-gray-400 leading-relaxed mb-2">{inc.description}</p>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-gray-500 mb-2">
                <span>Dept: <span className="text-gray-300">{inc.department}</span></span>
                <span>ID: <span className="text-gray-300 font-mono">{inc.id}</span></span>
                {inc.assignedTo && <span>RCA Lead: <span className="text-gray-300">{inc.assignedTo}</span></span>}
              </div>
              {inc.status === 'open' && (
                <Button variant="outline" size="sm" className="text-xs h-7 gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => escalate(inc.id)} disabled={isPending}>
                  <ArrowUpRight className="w-3 h-3" /> Escalate
                </Button>
              )}
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}
