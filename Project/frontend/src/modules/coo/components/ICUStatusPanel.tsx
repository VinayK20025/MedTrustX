'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import type { IcuMetrics } from '../types/coo.types';
import { Activity } from 'lucide-react';

interface ICUStatusPanelProps {
  data: IcuMetrics;
}

export function ICUStatusPanel({ data }: ICUStatusPanelProps) {
  const isCriticalLoad = data.occupiedBeds / data.totalBeds > 0.95;

  return (
    <Card className={`border-white/[0.06] shadow-glass h-full ${isCriticalLoad ? 'bg-emergency/5 border-emergency/20' : 'bg-surface-light'}`}>
      <CardHeader className="border-b border-white/[0.04] px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className={`w-5 h-5 ${isCriticalLoad ? 'text-emergency-light' : 'text-teal-400'}`} />
          <div>
            <h3 className="text-lg font-semibold text-white tracking-wide">ICU Control</h3>
            <p className="text-xs text-gray-400 mt-0.5">Critical care capacity</p>
          </div>
        </div>
      </CardHeader>
      
      <CardBody className="p-5 grid grid-cols-2 gap-4">
        <div className="p-4 bg-white/[0.02] rounded-xl border border-white/[0.04] flex flex-col items-center justify-center">
          <p className="text-xs text-gray-400 uppercase tracking-widest font-semibold mb-2">Occupancy</p>
          <div className="flex items-baseline gap-1">
            <span className={`text-3xl font-black ${isCriticalLoad ? 'text-emergency-light' : 'text-white'}`}>{data.occupiedBeds}</span>
            <span className="text-sm text-gray-500">/ {data.totalBeds}</span>
          </div>
        </div>

        <div className="p-4 bg-white/[0.02] rounded-xl border border-white/[0.04] flex flex-col items-center justify-center">
          <p className="text-xs text-gray-400 uppercase tracking-widest font-semibold mb-2">Critical Patients</p>
          <span className="text-3xl font-black text-warning-light">{data.criticalPatients}</span>
        </div>

        <div className="p-4 bg-white/[0.02] rounded-xl border border-white/[0.04] flex flex-col items-center justify-center">
          <p className="text-xs text-gray-400 uppercase tracking-widest font-semibold mb-2">Available Vents</p>
          <span className={`text-3xl font-black ${data.availableVentilators < 5 ? 'text-emergency-light' : 'text-teal-400'}`}>
            {data.availableVentilators}
          </span>
        </div>

        <div className="p-4 bg-white/[0.02] rounded-xl border border-white/[0.04] flex flex-col items-center justify-center">
          <p className="text-xs text-gray-400 uppercase tracking-widest font-semibold mb-2">Nurse:Patient</p>
          <span className="text-3xl font-black text-white">{data.nurseToPatientRatio}</span>
        </div>
      </CardBody>
    </Card>
  );
}
