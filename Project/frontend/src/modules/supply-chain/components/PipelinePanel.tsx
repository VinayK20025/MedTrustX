'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import type { PipelineStage } from '../types/supply-chain.types';
import { Route, AlertTriangle, ArrowRight } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { pipeline: PipelineStage[]; }

export function PipelinePanel({ pipeline }: Props) {
  return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col">
      <CardHeader className="border-b border-white/[0.04] px-4 py-3 flex justify-between items-center">
        <h3 className="text-[14px] font-bold text-white flex items-center gap-2">
          <Route className="w-4 h-4 text-purple-400" /> Pipeline Flow
        </h3>
      </CardHeader>

      <CardBody className="p-4 flex-1 overflow-y-auto">
        <div className="relative">
          {/* Vertical connecting line */}
          <div className="absolute left-6 top-4 bottom-4 w-0.5 bg-white/5" />

          <div className="space-y-6 relative">
            {pipeline.map((stage, idx) => (
              <div key={stage.id} className="flex items-start gap-4">
                <div className={cn('w-12 h-12 rounded-full flex items-center justify-center shrink-0 border-4 border-[#020504] relative z-10 shadow-lg',
                  stage.status === 'Delayed' ? 'bg-warning/20 border-warning/50 text-warning-light animate-pulse' :
                  stage.status === 'Complete' ? 'bg-success/20 border-success/50 text-success-light' : 'bg-purple-500/20 border-purple-500/50 text-purple-400'
                )}>
                  {stage.status === 'Delayed' ? <AlertTriangle className="w-5 h-5" /> : <span className="text-[14px] font-black">{idx + 1}</span>}
                </div>
                
                <div className="flex-1 bg-white/[0.02] border border-white/10 rounded-xl p-3 hover:bg-white/[0.04] transition-colors cursor-pointer">
                  <div className="flex justify-between items-center mb-1">
                    <h4 className="text-[13px] font-bold text-white uppercase tracking-wider">{stage.name}</h4>
                    <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded',
                      stage.status === 'Delayed' ? 'bg-warning/15 text-warning-light' : 'bg-white/5 text-gray-400'
                    )}>{stage.status}</span>
                  </div>
                  <p className="text-[11px] text-gray-400">Items in stage: <strong className={cn('font-mono text-[13px]', stage.status === 'Delayed' ? 'text-warning-light' : 'text-white')}>{stage.count}</strong></p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
