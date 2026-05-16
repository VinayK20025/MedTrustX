'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import type { TechDebtItem } from '../types/cto.types';
import { Wrench } from 'lucide-react';

interface TechDebtPanelProps {
  items: TechDebtItem[];
}

const severityStyle: Record<string, string> = {
  critical: 'bg-emergency text-white',
  high: 'bg-emergency/20 text-emergency-light border border-emergency/30',
  medium: 'bg-warning/20 text-warning-light border border-warning/30',
  low: 'bg-white/10 text-gray-300 border border-white/20',
};

const categoryStyle: Record<string, string> = {
  code_quality:   'text-indigo-300 bg-indigo-500/10',
  dependency:     'text-orange-300 bg-orange-500/10',
  architecture:   'text-teal-300 bg-teal-500/10',
  testing:        'text-yellow-300 bg-yellow-500/10',
  documentation:  'text-gray-300 bg-white/5',
};

const statusStyle: Record<string, string> = {
  backlog:     'text-gray-400',
  planned:     'text-indigo-300',
  in_progress: 'text-warning-light',
  resolved:    'text-success-light',
};

export function TechDebtPanel({ items }: TechDebtPanelProps) {
  return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col">
      <CardHeader className="border-b border-white/[0.04] px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Wrench className="w-5 h-5 text-warning-light" />
          <div>
            <h3 className="text-lg font-semibold text-white tracking-wide">Technical Debt</h3>
            <p className="text-xs text-gray-400 mt-0.5">Prioritized engineering debt backlog</p>
          </div>
        </div>
        <span className="text-xs text-warning-light bg-warning/10 px-2 py-1 rounded-full border border-warning/20 font-bold">
          {items.length} items
        </span>
      </CardHeader>
      
      <CardBody className="p-0 flex-1 overflow-y-auto max-h-[350px]">
        <div className="divide-y divide-white/[0.04]">
          {items.map(item => (
            <div key={item.id} className="p-4 hover:bg-white/[0.02] transition-colors">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded ${severityStyle[item.severity]}`}>
                  {item.severity}
                </span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded ${categoryStyle[item.category]}`}>
                  {item.category.replace('_', ' ')}
                </span>
                <span className={`text-[10px] ml-auto font-bold uppercase tracking-wider ${statusStyle[item.status]}`}>
                  ● {item.status.replace('_', ' ')}
                </span>
              </div>
              
              <h4 className="text-sm font-semibold text-white mb-1.5">{item.title}</h4>
              
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-gray-500 font-mono">
                <span>repo: <span className="text-gray-300">{item.repo}</span></span>
                <span>effort: <span className="text-gray-300">{item.effort}</span></span>
                {item.assignedTo && <span>owner: <span className="text-gray-300">{item.assignedTo}</span></span>}
              </div>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}
