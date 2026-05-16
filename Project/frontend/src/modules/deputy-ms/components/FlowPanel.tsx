'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { FlowQueueItem } from '../types/deputy-ms.types';
import { ArrowDownToLine, ArrowUpFromLine, Siren, CheckCircle, Clock } from 'lucide-react';
import { useResolveItem } from '../hooks/useDeputyMSAnalytics';

interface Props { entries: FlowQueueItem[]; }

const typeIcon = { admission: ArrowDownToLine, discharge: ArrowUpFromLine, er_triage: Siren };
const typeColor = { admission: 'text-success-light', discharge: 'text-indigo-300', er_triage: 'text-emergency-light' };
const statusStyle: Record<string, string> = {
  waiting:    'bg-warning/20 text-warning-light',
  processing: 'bg-indigo-500/20 text-indigo-300',
  delayed:    'bg-emergency/20 text-emergency-light',
  completed:  'bg-success/20 text-success-light',
};
const priorityColor: Record<string, string> = { routine: 'text-gray-400', urgent: 'text-warning-light', emergency: 'text-emergency-light font-bold' };

export function FlowPanel({ entries }: Props) {
  const { mutate: resolve, isPending } = useResolveItem();
  const delayed = entries.filter(e => e.status === 'delayed').length;
  const longWait = entries.filter(e => e.waitTime > 30).length;

  return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col">
      <CardHeader className="border-b border-white/[0.04] px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-warning-light" />
          <div>
            <h3 className="text-lg font-semibold text-white tracking-wide">Patient Flow Queue</h3>
            <p className="text-xs text-gray-400 mt-0.5">{entries.length} items • {longWait} long-wait</p>
          </div>
        </div>
        {delayed > 0 && <span className="text-xs text-emergency-light bg-emergency/10 px-2 py-1 rounded-full border border-emergency/20 font-bold animate-pulse">{delayed} delayed</span>}
      </CardHeader>
      <CardBody className="p-0 flex-1 overflow-y-auto max-h-[420px]">
        <div className="divide-y divide-white/[0.04]">
          {entries.map(e => {
            const Icon = typeIcon[e.type];
            return (
              <div key={e.id} className="p-4 hover:bg-white/[0.02] transition-colors group">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <Icon className={`w-4 h-4 ${typeColor[e.type]}`} />
                  <span className="text-sm font-semibold text-white">{e.patientName}</span>
                  <span className="text-[10px] text-gray-500">({e.age}y)</span>
                  <span className={`text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded ${statusStyle[e.status]}`}>{e.status}</span>
                  <span className={`text-[10px] uppercase ml-auto ${priorityColor[e.priority]}`}>● {e.priority}</span>
                </div>
                <div className="flex flex-wrap gap-x-4 text-[10px] text-gray-500 mb-1">
                  <span>Dept: <span className="text-gray-300">{e.department}</span></span>
                  {e.ward && <span>Ward: <span className="text-gray-300">{e.ward}</span></span>}
                  {e.bed && <span>Bed: <span className="text-gray-300">{e.bed}</span></span>}
                  <span>Wait: <span className={e.waitTime > 60 ? 'text-emergency-light font-bold' : e.waitTime > 30 ? 'text-warning-light' : 'text-gray-300'}>{e.waitTime} min</span></span>
                </div>
                {e.delayReason && <p className="text-[10px] text-emergency-light bg-emergency/5 px-2 py-1 rounded mt-1">⚠ {e.delayReason}</p>}
                {e.assignedTo && <p className="text-[10px] text-gray-500 mt-1">→ {e.assignedTo}</p>}
                {(e.status === 'delayed' || e.status === 'waiting') && (
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
