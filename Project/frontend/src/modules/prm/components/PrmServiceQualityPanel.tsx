'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import type { ServiceQualityMetric } from '../types/prm.types';
import { BarChart3, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { metrics: ServiceQualityMetric[]; }

export function PrmServiceQualityPanel({ metrics }: Props) {
  return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col">
      <CardHeader className="border-b border-white/[0.04] p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-emerald-400" />
          <h3 className="text-[13px] font-bold tracking-widest text-emerald-400">SERVICE QUALITY TRENDS</h3>
        </div>
      </CardHeader>

      <CardBody className="p-0 flex-1 overflow-y-auto">
        <div className="divide-y divide-white/[0.03]">
          {metrics.map(m => (
            <div key={m.department} className="p-4">
              <div className="flex justify-between items-start mb-3">
                <h4 className="text-[13px] font-bold text-white">{m.department}</h4>
                <span className={cn("text-[9px] uppercase font-bold flex items-center gap-1", 
                  m.trend === 'Improving' ? 'text-success-light' : m.trend === 'Declining' ? 'text-emergency-light' : 'text-gray-400'
                )}>
                  {m.trend === 'Improving' && <TrendingUp className="w-3 h-3"/>}
                  {m.trend === 'Declining' && <TrendingDown className="w-3 h-3"/>}
                  {m.trend === 'Stable' && <Minus className="w-3 h-3"/>}
                  {m.trend}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="bg-black/20 p-2 rounded border border-white/5 text-center">
                  <span className="block text-[10px] text-gray-500 mb-1">Avg Rating</span>
                  <span className="font-mono text-white text-[13px] font-bold">{m.avgRating}/5</span>
                </div>
                <div className="bg-black/20 p-2 rounded border border-white/5 text-center">
                  <span className="block text-[10px] text-gray-500 mb-1">NPS</span>
                  <span className={cn("font-mono text-[13px] font-bold", m.npsScore > 30 ? "text-success-light" : m.npsScore < 0 ? "text-emergency-light" : "text-warning-light")}>{m.npsScore > 0 ? `+${m.npsScore}` : m.npsScore}</span>
                </div>
                <div className="bg-black/20 p-2 rounded border border-white/5 text-center">
                  <span className="block text-[10px] text-gray-500 mb-1">Complaints</span>
                  <span className={cn("font-mono text-[13px] font-bold", m.complaintVolume > 10 ? "text-emergency-light" : "text-white")}>{m.complaintVolume}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}
