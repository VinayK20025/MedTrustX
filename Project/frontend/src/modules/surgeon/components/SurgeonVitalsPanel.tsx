'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import type { IntraOpVitals } from '../types/surgeon.types';
import { Activity, HeartPulse } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { vitals?: IntraOpVitals; }

export function SurgeonVitalsPanel({ vitals }: Props) {
  if (!vitals) return null;

  return (
    <Card className="border-white/[0.06] shadow-glass bg-black h-full flex flex-col font-mono text-white">
      <CardHeader className="border-b border-white/[0.04] px-5 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-emerald-400" />
          <h3 className="text-[13px] font-bold tracking-widest text-gray-400">ANESTHESIA MONITOR</h3>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-bold tracking-wider">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          LIVE
        </div>
      </CardHeader>

      <CardBody className="p-4 flex-1 flex flex-col justify-center">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-[#111] p-4 rounded-lg border border-white/5">
            <span className="text-[11px] text-emerald-500 font-bold block mb-1">HR (BPM)</span>
            <span className="text-4xl font-black text-emerald-400">{vitals.heartRate}</span>
          </div>
          <div className="bg-[#111] p-4 rounded-lg border border-white/5">
            <span className="text-[11px] text-blue-500 font-bold block mb-1">BP (mmHg)</span>
            <span className="text-4xl font-black text-blue-400">{vitals.bloodPressure.sys}<span className="text-xl text-blue-500">/{vitals.bloodPressure.dia}</span></span>
          </div>
          <div className="bg-[#111] p-4 rounded-lg border border-white/5">
            <span className="text-[11px] text-teal-500 font-bold block mb-1">SpO2 (%)</span>
            <span className={cn("text-4xl font-black", vitals.spO2 < 94 ? "text-emergency-light" : "text-teal-400")}>{vitals.spO2}</span>
          </div>
          <div className="bg-[#111] p-4 rounded-lg border border-white/5">
            <span className="text-[11px] text-purple-500 font-bold block mb-1">BIS Score</span>
            <span className="text-4xl font-black text-purple-400">{vitals.anesthesiaDepth}</span>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
