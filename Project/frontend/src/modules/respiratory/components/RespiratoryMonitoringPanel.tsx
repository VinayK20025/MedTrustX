'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import type { RespiratoryVitals } from '../types/respiratory.types';
import { Activity, HeartPulse } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { vitals: RespiratoryVitals[]; }

export function RespiratoryMonitoringPanel({ vitals }: Props) {
  return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-dark h-full flex flex-col font-mono">
      <CardHeader className="border-b border-white/[0.04] px-5 py-4 flex items-center justify-between bg-surface-light">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-emerald-500/15"><Activity className="w-4 h-4 text-emerald-400" /></div>
          <div>
            <h3 className="text-[15px] font-bold text-white tracking-wide font-sans">Live Respiratory Telemetry</h3>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-sans font-bold tracking-wider">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          STREAMING
        </div>
      </CardHeader>

      <CardBody className="p-4 flex-1 overflow-y-auto max-h-[400px]">
        <div className="grid grid-cols-2 gap-4">
          {vitals.map(v => (
            <div key={v.patientId} className={cn("p-4 rounded-xl border", v.spO2 < 90 ? "border-emergency/40 bg-emergency/5" : "border-white/[0.04] bg-surface-dark")}>
              <div className="flex justify-between items-center mb-4">
                <span className="text-xs text-gray-400 font-bold">{v.patientId}</span>
                <span className="text-[9px] text-gray-500">{new Date(v.timestamp).toLocaleTimeString()}</span>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center bg-white/5 py-3 rounded-lg">
                  <span className="text-[10px] text-gray-500 block mb-1">SpO2 %</span>
                  <span className={cn("text-3xl font-black", v.spO2 < 90 ? "text-emergency-light" : "text-emerald-400")}>{v.spO2}</span>
                </div>
                <div className="text-center bg-white/5 py-3 rounded-lg">
                  <span className="text-[10px] text-gray-500 block mb-1">RR /min</span>
                  <span className={cn("text-3xl font-black", v.respiratoryRate > 25 ? "text-warning-light" : "text-emerald-400")}>{v.respiratoryRate}</span>
                </div>
                <div className="text-center bg-white/5 py-2 rounded-lg">
                  <span className="text-[9px] text-gray-500 block">Tidal Vol (mL)</span>
                  <span className="text-lg font-bold text-blue-300">{v.tidalVolume}</span>
                </div>
                <div className="text-center bg-white/5 py-2 rounded-lg">
                  <span className="text-[9px] text-gray-500 block">ETCO2 (mmHg)</span>
                  <span className="text-lg font-bold text-purple-300">{v.etco2 || '--'}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}
