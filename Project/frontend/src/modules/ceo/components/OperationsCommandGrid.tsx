'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import type { OperationsMetrics } from '../types/ceo.types';
import { Button } from '@/components/ui/Button';

interface OperationsCommandGridProps {
  data?: OperationsMetrics;
}

const DEFAULT_OPS: OperationsMetrics = {
  bedOccupancyRate: 0, icuLoad: 0, pendingDischarges: 0,
  erWaitTimeAvg: 0, otBacklog: 0, criticalBottlenecks: 0,
};

export function OperationsCommandGrid({ data }: OperationsCommandGridProps) {
  const d = data ?? DEFAULT_OPS;

  const getStatusColor = (value: number, threshold: number) => {
    if (value > threshold) return 'text-emergency-light bg-emergency/10 border-emergency/20';
    if (value > threshold * 0.85) return 'text-warning-light bg-warning/10 border-warning/20';
    return 'text-white bg-white/[0.04] border-white/[0.06]';
  };

  return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full">
      <CardHeader className="border-b border-white/[0.04] px-5 py-4 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white tracking-wide">Operations Command</h3>
          <p className="text-xs text-gray-400 mt-0.5">Real-time facility load</p>
        </div>
        <Button variant="outline" size="sm" className="text-xs h-8">
          Reallocate Beds
        </Button>
      </CardHeader>
      
      <CardBody className="p-5">
        <div className="grid grid-cols-2 gap-4">
          <div className={`p-4 rounded-xl border ${getStatusColor(d.bedOccupancyRate, 90)}`}>
            <p className="text-xs uppercase tracking-wide font-medium opacity-80 mb-1">Bed Occupancy</p>
            <p className="text-3xl font-bold">{d.bedOccupancyRate}%</p>
          </div>

          <div className={`p-4 rounded-xl border ${getStatusColor(d.icuLoad, 90)}`}>
            <p className="text-xs uppercase tracking-wide font-medium opacity-80 mb-1">ICU Load</p>
            <p className="text-3xl font-bold">{d.icuLoad}%</p>
          </div>

          <div className={`p-4 rounded-xl border ${getStatusColor(d.pendingDischarges, 50)}`}>
            <p className="text-xs uppercase tracking-wide font-medium opacity-80 mb-1">Pending Discharges</p>
            <p className="text-3xl font-bold">{d.pendingDischarges}</p>
          </div>

          <div className={`p-4 rounded-xl border ${getStatusColor(d.criticalBottlenecks, 2)}`}>
            <p className="text-xs uppercase tracking-wide font-medium opacity-80 mb-1">Bottlenecks</p>
            <p className="text-3xl font-bold">{d.criticalBottlenecks}</p>
          </div>
        </div>

        <div className="mt-5 pt-5 border-t border-white/[0.06] grid grid-cols-2 gap-4">
          <div>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-gray-400">ER Wait Time Avg</span>
              <span className="text-white font-medium">{d.erWaitTimeAvg} mins</span>
            </div>
            <div className="h-1.5 w-full bg-white/[0.05] rounded-full overflow-hidden">
              <div className="h-full bg-warning rounded-full" style={{ width: `${Math.min((d.erWaitTimeAvg / 60) * 100, 100)}%` }} />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-gray-400">OT Backlog</span>
              <span className="text-white font-medium">{d.otBacklog} cases</span>
            </div>
            <div className="h-1.5 w-full bg-white/[0.05] rounded-full overflow-hidden">
              <div className="h-full bg-teal-500 rounded-full" style={{ width: `${Math.min((d.otBacklog / 15) * 100, 100)}%` }} />
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
