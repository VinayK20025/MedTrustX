'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { Violation } from '../types/cco.types';
import { AlertTriangle, ArrowUpRight } from 'lucide-react';
import { useEscalateViolation } from '../hooks/useCcoAnalytics';

interface ViolationsPanelProps {
  violations: Violation[];
}

const severityStyle: Record<string, string> = {
  critical: 'bg-emergency text-white',
  major:    'bg-emergency/20 text-emergency-light border border-emergency/30',
  minor:    'bg-warning/20 text-warning-light border border-warning/30',
};

const categoryStyle: Record<string, string> = {
  clinical:      'text-teal-300 bg-teal-500/10',
  financial:     'text-indigo-300 bg-indigo-500/10',
  operational:   'text-blue-300 bg-blue-500/10',
  documentation: 'text-orange-300 bg-orange-500/10',
  safety:        'text-emergency-light bg-emergency/10',
};

export function ViolationsPanel({ violations }: ViolationsPanelProps) {
  const { mutate: escalate, isPending } = useEscalateViolation();

  return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col">
      <CardHeader className="border-b border-white/[0.04] px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-emergency-light" />
          <div>
            <h3 className="text-lg font-semibold text-white tracking-wide">Violations Tracker</h3>
            <p className="text-xs text-gray-400 mt-0.5">Open compliance deviations requiring action</p>
          </div>
        </div>
      </CardHeader>
      
      <CardBody className="p-0 flex-1 overflow-y-auto max-h-[420px]">
        <div className="divide-y divide-white/[0.04]">
          {violations.map(v => (
            <div key={v.id} className="p-4 hover:bg-white/[0.02] transition-colors group">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded ${severityStyle[v.severity]}`}>
                  {v.severity}
                </span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded ${categoryStyle[v.category]}`}>
                  {v.category}
                </span>
                <span className="text-[10px] text-gray-500 font-mono ml-auto">{v.id}</span>
              </div>
              
              <h4 className="text-sm font-semibold text-white mb-1">{v.title}</h4>
              <p className="text-xs text-gray-400 leading-relaxed mb-2">{v.description}</p>
              
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-gray-500 mb-3">
                <span>Dept: <span className="text-gray-300">{v.department}</span></span>
                <span>Owner: <span className="text-gray-300">{v.assignedTo || 'Unassigned'}</span></span>
                <span>Due: <span className={new Date(v.dueDate) < new Date() ? 'text-emergency-light' : 'text-gray-300'}>
                  {new Date(v.dueDate).toLocaleDateString()}
                </span></span>
              </div>
              
              {v.status === 'open' && (
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="primary" size="sm" className="text-xs h-7">Assign</Button>
                  <Button variant="outline" size="sm" className="text-xs h-7 gap-1"
                    onClick={() => escalate(v.id)} disabled={isPending}>
                    <ArrowUpRight className="w-3 h-3" /> Escalate
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}
