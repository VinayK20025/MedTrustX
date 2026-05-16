'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import type { AnesthesiaTelemetry } from '../types/anesthesiaTech.types';
import { Activity } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { telemetry: AnesthesiaTelemetry[]; }

export function AnesthesiaMonitoringPanel({ telemetry }: Props) {
  return (
    <Card className="border-teal-500/30 shadow-glass bg-black h-full flex flex-col font-mono relative overflow-hidden">
      <div className="absolute top-0 left-0 w-1 h-full bg-teal-500 animate-pulse" />
      <CardHeader className="border-b border-white/[0.04] px-5 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-teal-400" />
          <h3 className="text-[13px] font-bold tracking-widest text-gray-400">GAS & VENTILATION TELEMETRY</h3>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-teal-400 font-bold tracking-wider">
          <div className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
          LIVE (5s)
        </div>
      </CardHeader>

      <CardBody className="p-4 flex-1 overflow-y-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {telemetry.map(tel => (
            <div key={tel.machineId} className="bg-[#111] p-4 rounded-lg border border-white/10">
              <div className="flex justify-between items-start border-b border-white/5 pb-2 mb-3">
                <h4 className="text-[12px] font-bold text-white">{tel.machineId}</h4>
                <span className={cn("text-[9px] px-1.5 py-0.5 rounded", tel.status === 'Nominal' ? 'bg-success/20 text-success-light' : 'bg-emergency/20 text-emergency-light animate-pulse')}>
                  {tel.status}
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-[10px]">
                <div className="bg-black p-2 rounded">
                  <span className="text-gray-500 block">Paw (cmH2O)</span>
                  <span className="text-[16px] text-blue-400">{tel.circuitPressure}</span>
                </div>
                <div className="bg-black p-2 rounded">
                  <span className="text-gray-500 block">VT (mL)</span>
                  <span className="text-[16px] text-emerald-400">{tel.tidalVolume}</span>
                </div>
                <div className="bg-black p-2 rounded">
                  <span className="text-gray-500 block">FiO2 (%)</span>
                  <span className="text-[16px] text-teal-400">{tel.fio2}</span>
                </div>
                <div className="bg-black p-2 rounded">
                  <span className="text-gray-500 block">EtCO2 (mmHg)</span>
                  <span className="text-[16px] text-yellow-400">{tel.etco2}</span>
                </div>
              </div>
            </div>
          ))}
          {telemetry.length === 0 && <div className="col-span-2 text-center text-gray-500 p-8">No active telemetry feeds.</div>}
        </div>
      </CardBody>
    </Card>
  );
}
