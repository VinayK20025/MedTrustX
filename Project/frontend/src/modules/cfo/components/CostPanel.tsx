'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import type { CostCenter } from '../types/cfo.types';

interface CostPanelProps {
  centers: CostCenter[];
}

export function CostPanel({ centers }: CostPanelProps) {
  return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col">
      <CardHeader className="border-b border-white/[0.04] px-5 py-4">
        <h3 className="text-lg font-semibold text-white tracking-wide">Cost Center Analysis</h3>
        <p className="text-xs text-gray-400 mt-0.5">Budget vs Actual by department (₹ in Lakhs)</p>
      </CardHeader>
      
      <CardBody className="p-4 flex-1 overflow-y-auto space-y-3">
        {centers.map(center => {
          const isOver = center.variance < 0;
          const pctUsed = Math.min((center.actual / center.budget) * 100, 100);
          
          return (
            <div key={center.id} className="p-3 bg-white/[0.02] border border-white/[0.04] rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-white">{center.department}</span>
                <span className={`text-xs font-bold font-mono ${isOver ? 'text-emergency-light' : 'text-success-light'}`}>
                  {isOver ? '' : '+'}{center.variancePercent.toFixed(1)}%
                </span>
              </div>
              
              <div className="h-2 w-full bg-white/[0.05] rounded-full overflow-hidden mb-2">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${isOver ? 'bg-emergency' : 'bg-success'}`}
                  style={{ width: `${pctUsed}%` }}
                />
              </div>
              
              <div className="flex justify-between text-[10px] text-gray-500 font-mono">
                <span>Budget: ₹{center.budget}L</span>
                <span>Actual: ₹{center.actual}L</span>
                <span className={isOver ? 'text-emergency-light' : 'text-success-light'}>
                  {isOver ? 'Over' : 'Under'}: ₹{Math.abs(center.variance)}L
                </span>
              </div>
            </div>
          );
        })}
      </CardBody>
    </Card>
  );
}
