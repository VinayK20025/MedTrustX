'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import type { AuditRecord } from '../types/cco.types';
import { ClipboardList } from 'lucide-react';

interface AuditPanelProps {
  audits: AuditRecord[];
}

const statusStyle: Record<string, string> = {
  scheduled:   'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30',
  in_progress: 'bg-warning/20 text-warning-light border border-warning/30',
  completed:   'bg-success/20 text-success-light border border-success/30',
  overdue:     'bg-emergency/20 text-emergency-light border border-emergency/30',
};

const typeStyle: Record<string, string> = {
  internal:   'text-indigo-300 bg-indigo-500/10',
  external:   'text-teal-300 bg-teal-500/10',
  regulatory: 'text-warning-light bg-warning/10',
};

export function AuditPanel({ audits }: AuditPanelProps) {
  return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col">
      <CardHeader className="border-b border-white/[0.04] px-5 py-4 flex items-center gap-2">
        <ClipboardList className="w-5 h-5 text-indigo-400" />
        <div>
          <h3 className="text-lg font-semibold text-white tracking-wide">Audit Management</h3>
          <p className="text-xs text-gray-400 mt-0.5">Internal, external & regulatory audits</p>
        </div>
      </CardHeader>
      
      <CardBody className="p-4 flex-1 overflow-y-auto space-y-3">
        {audits.map(audit => (
          <div key={audit.id} className="p-3 bg-white/[0.02] border border-white/[0.04] rounded-xl hover:border-white/[0.08] transition-colors">
            <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className={`text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded ${statusStyle[audit.status]}`}>
                  {audit.status.replace('_', ' ')}
                </span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded ${typeStyle[audit.type]}`}>
                  {audit.type}
                </span>
              </div>
              <span className="text-[10px] text-gray-500 font-mono">{audit.id}</span>
            </div>
            
            <h4 className="text-sm font-semibold text-white mb-1.5">{audit.title}</h4>
            
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-gray-500">
              <span>Dept: <span className="text-gray-300">{audit.department}</span></span>
              <span>Auditor: <span className="text-gray-300">{audit.auditor}</span></span>
              <span>Date: <span className="text-gray-300">{audit.scheduledDate}</span></span>
              {audit.score != null && (
                <span>Score: <span className={audit.score >= 90 ? 'text-success-light' : 'text-warning-light'}>{audit.score}%</span></span>
              )}
              {audit.findingsCount > 0 && (
                <span>Findings: <span className="text-warning-light">{audit.findingsCount}</span></span>
              )}
            </div>
          </div>
        ))}
      </CardBody>
    </Card>
  );
}
