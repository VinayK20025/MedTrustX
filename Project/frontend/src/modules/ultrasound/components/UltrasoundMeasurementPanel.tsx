'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import type { UltrasoundMeasurement } from '../types/ultrasound.types';
import { Ruler, Activity } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { measurements: UltrasoundMeasurement[]; }

export function UltrasoundMeasurementPanel({ measurements }: Props) {
  return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col">
      <CardHeader className="border-b border-white/[0.04] px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-indigo-500/15"><Ruler className="w-4 h-4 text-indigo-400" /></div>
          <h3 className="text-[15px] font-bold text-white tracking-wide">Calipers & Measurements</h3>
        </div>
      </CardHeader>

      <CardBody className="p-0 flex-1 overflow-y-auto max-h-[300px]">
        {measurements.length === 0 ? (
           <div className="p-8 text-center text-[12px] text-gray-500 font-bold">No measurements logged. Use calipers on frozen image.</div>
        ) : (
          <div className="divide-y divide-white/[0.03]">
            {measurements.map(meas => (
              <div key={meas.id} className="p-4 hover:bg-white/[0.015] transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="text-[13px] font-bold text-white">{meas.label}</h4>
                    <span className="text-[10px] text-gray-500 mt-0.5 inline-block font-mono bg-surface-dark px-1.5 py-0.5 rounded">{meas.type}</span>
                  </div>
                  <span className="text-[14px] font-black text-indigo-400 font-mono tracking-wider">
                    {meas.value}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardBody>
    </Card>
  );
}
