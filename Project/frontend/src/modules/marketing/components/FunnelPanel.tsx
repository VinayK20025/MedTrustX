'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import type { FunnelStage } from '../types/marketing.types';
import { Filter } from 'lucide-react';

interface Props { stages: FunnelStage[]; }

export function FunnelPanel({ stages }: Props) {
  const maxCount = stages[0]?.count || 1;

  return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col">
      <CardHeader className="border-b border-white/[0.04] px-5 py-4 flex items-center gap-2">
        <Filter className="w-5 h-5 text-teal-400" />
        <div>
          <h3 className="text-lg font-semibold text-white tracking-wide">Lead Funnel</h3>
          <p className="text-xs text-gray-400 mt-0.5">Patient acquisition pipeline</p>
        </div>
      </CardHeader>
      <CardBody className="p-5 flex-1 space-y-3">
        {stages.map((s, i) => {
          const widthPct = Math.max((s.count / maxCount) * 100, 12);
          const colors = ['bg-indigo-500', 'bg-blue-500', 'bg-teal-500', 'bg-warning', 'bg-success'];
          return (
            <div key={s.stage}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-white">{s.stage}</span>
                <div className="flex items-center gap-3 text-[10px] font-mono">
                  <span className="text-gray-300">{s.count.toLocaleString()}</span>
                  {i > 0 && (
                    <span className="text-emergency-light">↓{s.dropOff}%</span>
                  )}
                </div>
              </div>
              <div className="h-6 w-full bg-white/[0.03] rounded-lg overflow-hidden flex items-center">
                <div 
                  className={`h-full rounded-lg ${colors[i]} transition-all duration-700 flex items-center justify-end pr-2`}
                  style={{ width: `${widthPct}%` }}
                >
                  {widthPct > 20 && (
                    <span className="text-[10px] text-white font-bold">{s.conversionRate}%</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </CardBody>
    </Card>
  );
}
