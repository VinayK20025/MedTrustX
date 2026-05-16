'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import type { InfectionMetrics } from '../types/cmo.types';
import { ShieldAlert } from 'lucide-react';

interface InfectionPanelProps {
  data: InfectionMetrics;
}

export function InfectionPanel({ data }: InfectionPanelProps) {
  const getStatusClasses = (status: string) => {
    switch (status) {
      case 'critical': return 'text-emergency-light bg-emergency/10 border-emergency/20';
      case 'warning': return 'text-warning-light bg-warning/10 border-warning/20';
      default: return 'text-success-light bg-success/10 border-success/20';
    }
  };

  return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col">
      <CardHeader className="border-b border-white/[0.04] px-5 py-4 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white tracking-wide">Infection Control</h3>
          <p className="text-xs text-gray-400 mt-0.5">HAI monitoring & targets</p>
        </div>
        <ShieldAlert className="w-5 h-5 text-indigo-400 opacity-50" />
      </CardHeader>
      
      <CardBody className="p-5 flex-1 flex flex-col">
        <div className="flex items-center justify-between mb-6 p-4 bg-white/[0.02] rounded-xl border border-white/[0.04]">
          <div className="text-center w-full">
            <p className="text-xs text-gray-500 uppercase tracking-widest font-semibold">Current Rate</p>
            <p className={`text-2xl font-bold mt-1 font-mono ${data.currentRate > data.targetRate ? 'text-emergency-light' : 'text-success-light'}`}>
              {data.currentRate}%
            </p>
          </div>
          <div className="w-px h-8 bg-white/10 mx-4" />
          <div className="text-center w-full">
            <p className="text-xs text-gray-500 uppercase tracking-widest font-semibold">Target</p>
            <p className="text-2xl font-bold text-gray-400 mt-1 font-mono">{data.targetRate}%</p>
          </div>
        </div>

        <div>
          <p className="text-xs text-gray-500 uppercase tracking-widest font-semibold mb-3">Ward Heatmap</p>
          <div className="grid grid-cols-2 gap-3">
            {data.wardHeatmap.map((ward) => (
              <div key={ward.ward} className={`p-3 rounded-lg border ${getStatusClasses(ward.status)} flex flex-col justify-center`}>
                <p className="text-xs font-semibold uppercase tracking-wide opacity-80 mb-1">{ward.ward}</p>
                <p className="text-xl font-bold font-mono">{ward.score}%</p>
              </div>
            ))}
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
