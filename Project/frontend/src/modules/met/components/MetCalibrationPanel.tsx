'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import type { MetCalibrationRecord } from '../types/met.types';
import { Settings, Crosshair } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { records: MetCalibrationRecord[]; }

export function MetCalibrationPanel({ records }: Props) {
  return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col">
      <CardHeader className="border-b border-white/[0.04] px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-blue-500/15"><Settings className="w-4 h-4 text-blue-400" /></div>
          <h3 className="text-[15px] font-bold text-white tracking-wide">Calibration & Testing</h3>
        </div>
      </CardHeader>

      <CardBody className="p-0 flex-1 overflow-y-auto max-h-[300px]">
        <div className="divide-y divide-white/[0.03]">
          {records.map(rec => (
            <div key={rec.id} className="p-5 hover:bg-white/[0.015] transition-colors">
              <div className="flex justify-between items-start mb-2">
                <h4 className="text-[13px] font-bold text-white flex items-center gap-2">
                  {rec.testName}
                </h4>
                <span className={cn('text-[9px] uppercase font-bold px-2 py-0.5 rounded tracking-wider', 
                  rec.status === 'Passed' ? 'bg-success/20 text-success-light' : 
                  rec.status === 'Adjusted' ? 'bg-blue-500/20 text-blue-400' : 'bg-emergency/20 text-emergency-light'
                )}>
                  {rec.status}
                </span>
              </div>
              
              <div className="flex justify-between items-center text-[10px] text-gray-400 bg-surface-dark p-2 rounded-lg mb-2">
                <span>Device: {rec.deviceId}</span>
                <span className="flex items-center gap-1"><Crosshair className="w-3 h-3 text-blue-400"/> Offset: {rec.accuracyOffset}%</span>
              </div>

              <div className="text-[9px] text-gray-500 font-mono flex justify-end">
                {new Date(rec.date).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}
