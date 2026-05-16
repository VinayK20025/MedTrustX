'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import type { PatientFlowMetrics } from '../types/coo.types';
import { ArrowRight, Clock } from 'lucide-react';

interface PatientFlowPanelProps {
  data: PatientFlowMetrics;
}

export function PatientFlowPanel({ data }: PatientFlowPanelProps) {
  return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full">
      <CardHeader className="border-b border-white/[0.04] px-5 py-4 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white tracking-wide">Patient Flow Pipeline</h3>
          <p className="text-xs text-gray-400 mt-0.5">Live hospital throughput</p>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-white/[0.04] text-gray-300 text-xs font-semibold">
          <Clock className="w-3 h-3 text-warning-light" />
          Avg Wait: <span className="text-white">{data.avgWaitTime}m</span>
        </div>
      </CardHeader>
      
      <CardBody className="p-5 flex flex-col justify-center">
        <div className="flex items-center justify-between relative">
          {/* Pipeline stages */}
          <div className="flex-1 flex flex-col items-center z-10">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center border-4 ${
              data.admissionsQueue > 20 ? 'border-warning text-warning-light bg-warning/10' : 'border-teal-500 text-teal-400 bg-teal-500/10'
            }`}>
              <span className="text-xl font-bold">{data.admissionsQueue}</span>
            </div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mt-3 text-center">Admissions<br/>Queue</p>
          </div>

          <div className="flex-1 flex justify-center text-gray-600 z-10">
            <ArrowRight className="w-6 h-6" />
          </div>

          <div className="flex-1 flex flex-col items-center z-10">
            <div className="w-20 h-20 rounded-full flex items-center justify-center border-4 border-indigo-500 text-indigo-400 bg-indigo-500/10 shadow-[0_0_15px_rgba(99,102,241,0.2)]">
              <span className="text-2xl font-black">{data.inProgress}</span>
            </div>
            <p className="text-xs font-semibold uppercase tracking-wider text-white mt-3 text-center">In Progress<br/>(Admitted)</p>
          </div>

          <div className="flex-1 flex justify-center text-gray-600 z-10">
            <ArrowRight className="w-6 h-6" />
          </div>

          <div className="flex-1 flex flex-col items-center z-10">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center border-4 ${
              data.dischargeQueue > 15 ? 'border-emergency text-emergency-light bg-emergency/10 shadow-[0_0_15px_rgba(244,63,94,0.3)]' : 'border-teal-500 text-teal-400 bg-teal-500/10'
            }`}>
              <span className="text-xl font-bold">{data.dischargeQueue}</span>
            </div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mt-3 text-center">Discharge<br/>Queue</p>
          </div>
          
          {/* Connecting line */}
          <div className="absolute top-10 left-8 right-8 h-1 bg-white/[0.04] -z-0 rounded-full" />
        </div>
      </CardBody>
    </Card>
  );
}
