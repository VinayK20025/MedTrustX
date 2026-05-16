'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import type { ShiftOverview } from '../types/cno.types';
import { Clock, CheckSquare } from 'lucide-react';

interface ShiftPanelProps {
  data: ShiftOverview;
}

export function ShiftPanel({ data }: ShiftPanelProps) {
  return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col">
      <CardHeader className="border-b border-white/[0.04] px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-indigo-400" />
          <div>
            <h3 className="text-lg font-semibold text-white tracking-wide">Shift Overview</h3>
            <p className="text-xs text-gray-400 mt-0.5">{data.currentShift}</p>
          </div>
        </div>
      </CardHeader>
      
      <CardBody className="p-5 flex-1 flex flex-col justify-center space-y-4">
        <div className="p-4 bg-white/[0.02] border border-white/[0.04] rounded-xl flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-widest font-semibold mb-1">Shift Manager</p>
            <p className="text-sm font-medium text-white">{data.shiftManager}</p>
          </div>
          <div className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-xs border border-indigo-500/30">
            {data.shiftManager.charAt(0)}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-white/[0.02] border border-white/[0.04] rounded-xl flex flex-col">
            <p className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold mb-2">Pending Handovers</p>
            <div className="flex items-center gap-2 mt-auto">
              <CheckSquare className="w-4 h-4 text-warning-light" />
              <span className={`text-2xl font-black font-mono ${data.handoversPending > 0 ? 'text-warning-light' : 'text-success-light'}`}>
                {data.handoversPending}
              </span>
            </div>
          </div>
          <div className="p-4 bg-white/[0.02] border border-white/[0.04] rounded-xl flex flex-col">
            <p className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold mb-2">Incidents</p>
            <span className={`text-2xl font-black font-mono mt-auto ${data.incidentsReported > 0 ? 'text-emergency-light' : 'text-gray-400'}`}>
              {data.incidentsReported}
            </span>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
