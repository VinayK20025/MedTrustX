'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { PatientFlowEntry } from '../types/superintendent.types';
import { ArrowDownToLine, ArrowUpFromLine, ArrowLeftRight, CheckCircle } from 'lucide-react';
import { useResolveFlowItem } from '../hooks/useSuperintendentAnalytics';

interface Props { entries: PatientFlowEntry[]; }

const typeIcon = { admission: ArrowDownToLine, discharge: ArrowUpFromLine, transfer: ArrowLeftRight };
const typeColor = { admission: 'text-success-light', discharge: 'text-indigo-300', transfer: 'text-warning-light' };
const statusStyle: Record<string, string> = {
  pending:     'bg-white/10 text-gray-300',
  in_progress: 'bg-indigo-500/20 text-indigo-300',
  delayed:     'bg-emergency/20 text-emergency-light animate-pulse',
  completed:   'bg-success/20 text-success-light',
};
const priorityStyle: Record<string, string> = {
  routine:   'text-gray-400',
  urgent:    'text-warning-light',
  emergency: 'text-emergency-light font-bold',
};

export function PatientFlowPanel({ entries }: Props) {
  const { mutate: resolve, isPending } = useResolveFlowItem();

  return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col">
      <CardHeader className="border-b border-white/[0.04] px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ArrowLeftRight className="w-5 h-5 text-teal-400" />
          <div>
            <h3 className="text-lg font-semibold text-white tracking-wide">Patient Flow</h3>
            <p className="text-xs text-gray-400 mt-0.5">Admissions, discharges & transfers</p>
          </div>
        </div>
        <span className="text-xs text-emergency-light bg-emergency/10 px-2 py-1 rounded-full border border-emergency/20 font-bold">
          {entries.filter(e => e.status === 'delayed').length} delayed
        </span>
      </CardHeader>
      <CardBody className="p-0 flex-1 overflow-y-auto max-h-[400px]">
        <div className="divide-y divide-white/[0.04]">
          {entries.map(e => {
            const Icon = typeIcon[e.type];
            return (
              <div key={e.id} className="p-4 hover:bg-white/[0.02] transition-colors group">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <Icon className={`w-4 h-4 ${typeColor[e.type]}`} />
                  <span className="text-sm font-semibold text-white">{e.patientName}</span>
                  <span className={`text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded ${statusStyle[e.status]}`}>{e.status.replace('_', ' ')}</span>
                  <span className={`text-[10px] uppercase ml-auto ${priorityStyle[e.priority]}`}>● {e.priority}</span>
                </div>
                <div className="flex flex-wrap gap-x-4 text-[10px] text-gray-500">
                  <span>Dept: <span className="text-gray-300">{e.department}</span></span>
                  {e.ward && <span>Ward: <span className="text-gray-300">{e.ward}</span></span>}
                  <span>Type: <span className="text-gray-300 capitalize">{e.type}</span></span>
                </div>
                {e.delayReason && (
                  <p className="text-[10px] text-emergency-light mt-1.5 bg-emergency/5 px-2 py-1 rounded">⚠ {e.delayReason}</p>
                )}
                {e.status === 'delayed' && (
                  <Button variant="outline" size="sm" className="mt-2 text-xs h-7 gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => resolve(e.id)} disabled={isPending}>
                    <CheckCircle className="w-3 h-3" /> Resolve
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      </CardBody>
    </Card>
  );
}
