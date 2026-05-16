'use client';
import React from 'react';
import { ChartCard } from './ChartCard';
import type { OperationsMetrics } from '../types/board.types';

interface OperationsPanelProps {
  data: OperationsMetrics;
  className?: string;
}

export function OperationsPanel({ data, className }: OperationsPanelProps) {
  return (
    <ChartCard 
      title="Facility Utilization" 
      subtitle="Current capacity and operational throughput"
      className={className}
      bodyClassName="flex flex-col justify-center"
    >
      <div className="space-y-6">
        {data.occupancyByUnit.map((unit) => {
          const percentage = (unit.current / unit.capacity) * 100;
          const isWarning = percentage > 85 && percentage <= 95;
          const isCritical = percentage > 95;
          
          return (
            <div key={unit.unit}>
              <div className="flex justify-between text-sm mb-2">
                <span className="font-medium text-gray-200">{unit.unit}</span>
                <span className="text-gray-400">
                  <span className={isCritical ? 'text-emergency-light font-bold' : isWarning ? 'text-warning-light font-bold' : 'text-white font-medium'}>
                    {unit.current}
                  </span>
                  {' '} / {unit.capacity} beds
                </span>
              </div>
              <div className="h-2.5 w-full bg-white/[0.05] rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-1000 ${
                    isCritical ? 'bg-emergency' : isWarning ? 'bg-warning' : 'bg-teal-500'
                  }`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
        
        <div className="pt-4 mt-2 border-t border-white/[0.06] grid grid-cols-2 gap-4">
          <div className="p-3 bg-white/[0.02] rounded-lg">
            <p className="text-xs text-gray-500 uppercase tracking-wide">Daily Throughput</p>
            <p className="text-2xl font-semibold text-white mt-1">{data.throughput.value}</p>
          </div>
          <div className="p-3 bg-white/[0.02] rounded-lg">
            <p className="text-xs text-gray-500 uppercase tracking-wide">OT Utilization</p>
            <p className="text-2xl font-semibold text-white mt-1">{data.otUtilization.value}%</p>
          </div>
        </div>
      </div>
    </ChartCard>
  );
}
