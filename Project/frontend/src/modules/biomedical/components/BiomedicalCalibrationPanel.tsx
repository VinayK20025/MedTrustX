'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { CalibrationRecord } from '../types/biomedical.types';
import { useLogCalibration } from '../hooks/useBiomedicalAnalytics';
import { Settings, ShieldCheck, AlertCircle } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { records: CalibrationRecord[]; }

export function BiomedicalCalibrationPanel({ records }: Props) {
  const { mutate: logCal, isPending } = useLogCalibration();

  return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col">
      <CardHeader className="border-b border-white/[0.04] px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-teal-500/15"><Settings className="w-4 h-4 text-teal-400" /></div>
          <h3 className="text-[15px] font-bold text-white tracking-wide">Calibration Schedules</h3>
        </div>
      </CardHeader>

      <CardBody className="p-0 flex-1 overflow-y-auto max-h-[300px]">
        <div className="divide-y divide-white/[0.03]">
          {records.map(rec => (
            <div key={rec.id} className="p-5 hover:bg-white/[0.015] transition-colors">
              <div className="flex justify-between items-start mb-2">
                <h4 className="text-[13px] font-bold text-white flex items-center gap-2">
                  {rec.deviceId}
                  {rec.status === 'Overdue' && <AlertCircle className="w-3.5 h-3.5 text-emergency-light animate-pulse" />}
                </h4>
                <span className={cn('text-[9px] uppercase font-bold px-2 py-0.5 rounded tracking-wider', 
                  rec.status === 'Compliant' ? 'bg-success/20 text-success-light' : 
                  rec.status === 'Due Soon' ? 'bg-warning/20 text-warning-light' : 'bg-emergency/20 text-emergency-light'
                )}>
                  {rec.status}
                </span>
              </div>
              
              <div className="flex justify-between items-center text-[10px] text-gray-400 bg-surface-dark p-2 rounded-lg mb-3">
                <span>Last: {new Date(rec.lastCalibrationDate).toLocaleDateString()}</span>
                <span className={rec.status === 'Overdue' ? 'text-emergency-light font-bold' : ''}>Due: {new Date(rec.nextCalibrationDue).toLocaleDateString()}</span>
              </div>

              <div className="flex justify-end">
                {rec.status !== 'Compliant' ? (
                  <Button size="xs" onClick={() => logCal(rec.id)} disabled={isPending} className="h-7 text-[10px] bg-teal-600 hover:bg-teal-500 border-none font-bold text-white">
                    Log New Calibration
                  </Button>
                ) : (
                  <span className="text-[10px] text-success-light flex items-center gap-1"><ShieldCheck className="w-3 h-3"/> Certified by {rec.performedBy || 'System'}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}
