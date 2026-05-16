'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { ActiveIssue } from '../types/deputy-ms.types';
import { AlertTriangle, CheckCircle } from 'lucide-react';
import { useResolveItem } from '../hooks/useDeputyMSAnalytics';

interface Props { issues: ActiveIssue[]; }

const severityStyle: Record<string, string> = {
  critical: 'bg-emergency text-white',
  high:     'bg-emergency/20 text-emergency-light border border-emergency/30',
  medium:   'bg-warning/20 text-warning-light border border-warning/30',
  low:      'bg-white/10 text-gray-300 border border-white/20',
};
const typeStyle: Record<string, string> = {
  complaint:  'text-warning-light bg-warning/10',
  incident:   'text-emergency-light bg-emergency/10',
  escalation: 'text-indigo-300 bg-indigo-500/10',
  delay:      'text-orange-300 bg-orange-500/10',
};
const statusColor: Record<string, string> = {
  open:        'text-emergency-light',
  assigned:    'text-warning-light',
  in_progress: 'text-indigo-300',
  resolved:    'text-success-light',
};

export function IssuesPanel({ issues }: Props) {
  const { mutate: resolve, isPending } = useResolveItem();

  return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col">
      <CardHeader className="border-b border-white/[0.04] px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-emergency-light" />
          <div>
            <h3 className="text-lg font-semibold text-white tracking-wide">Active Issues</h3>
            <p className="text-xs text-gray-400 mt-0.5">Complaints, incidents & escalations</p>
          </div>
        </div>
        <span className="text-xs text-emergency-light bg-emergency/10 px-2 py-1 rounded-full border border-emergency/20 font-bold">
          {issues.filter(i => i.status === 'open').length} unresolved
        </span>
      </CardHeader>
      <CardBody className="p-0 flex-1 overflow-y-auto max-h-[400px]">
        <div className="divide-y divide-white/[0.04]">
          {issues.map(iss => (
            <div key={iss.id} className="p-4 hover:bg-white/[0.02] transition-colors group">
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded ${severityStyle[iss.severity]}`}>{iss.severity}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded ${typeStyle[iss.type]}`}>{iss.type}</span>
                <span className={`text-[10px] font-bold uppercase tracking-wider ml-auto ${statusColor[iss.status]}`}>● {iss.status.replace('_', ' ')}</span>
              </div>
              <h4 className="text-sm font-semibold text-white mb-1">{iss.title}</h4>
              <div className="flex flex-wrap gap-x-4 text-[10px] text-gray-500">
                <span>Dept: <span className="text-gray-300">{iss.department}</span></span>
                <span>ID: <span className="text-gray-300 font-mono">{iss.id}</span></span>
                {iss.assignedTo && <span>→ <span className="text-gray-300">{iss.assignedTo}</span></span>}
              </div>
              {iss.status === 'open' && (
                <Button variant="outline" size="sm" className="mt-2 text-xs h-7 gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => resolve(iss.id)} disabled={isPending}>
                  <CheckCircle className="w-3 h-3" /> Assign & Resolve
                </Button>
              )}
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}
