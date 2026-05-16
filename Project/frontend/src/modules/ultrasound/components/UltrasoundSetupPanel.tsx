'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import type { UltrasoundQueue, UltrasoundPreset } from '../types/ultrasound.types';
import { SlidersHorizontal } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { activePatient?: UltrasoundQueue; presets: UltrasoundPreset[]; }

export function UltrasoundSetupPanel({ activePatient, presets }: Props) {
  if (!activePatient) return null;

  return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col relative overflow-hidden">
      <div className="absolute top-0 left-0 w-1 h-full bg-teal-500" />
      <CardHeader className="border-b border-white/[0.04] px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-teal-400" />
          <h3 className="text-[15px] font-bold text-white tracking-wide">Transducer Presets</h3>
        </div>
        <div className="text-[10px] text-gray-400 font-mono">Exam: {activePatient.examType}</div>
      </CardHeader>

      <CardBody className="p-0 flex-1 overflow-y-auto">
        <div className="p-4 bg-white/[0.02] border-b border-white/5">
           <h4 className="text-[14px] font-bold text-white mb-1">Preset Selection</h4>
           <p className="text-[11px] text-gray-400 leading-relaxed font-mono">Loading a preset configures the transducer frequency, depth, and focal zones automatically.</p>
        </div>

        <div className="divide-y divide-white/[0.03]">
          {presets.filter(p => p.examType === activePatient.examType).map(preset => (
            <div key={preset.id} className="p-5 hover:bg-white/[0.015] transition-colors cursor-pointer border-l-2 border-transparent hover:border-teal-500">
              <div className="flex justify-between items-start mb-2">
                <h4 className="text-[13px] font-bold text-white">{preset.name}</h4>
                <span className="text-[10px] bg-white/5 px-2 py-0.5 rounded text-gray-400 font-mono">{preset.parameters.mode}</span>
              </div>
              <p className="text-[11px] text-gray-400 mb-4">{preset.description}</p>
              
              <div className="grid grid-cols-3 gap-2 text-[10px] font-mono">
                 <div className="bg-surface-dark p-2 rounded border border-white/5 text-center"><span className="block text-gray-500 mb-1">Probe</span><span className="text-white font-bold">{preset.parameters.probeHz}</span></div>
                 <div className="bg-surface-dark p-2 rounded border border-white/5 text-center"><span className="block text-gray-500 mb-1">Depth</span><span className="text-white font-bold">{preset.parameters.depthCm} cm</span></div>
                 <div className="bg-surface-dark p-2 rounded border border-white/5 text-center"><span className="block text-gray-500 mb-1">Gain</span><span className="text-white font-bold">{preset.parameters.gain}%</span></div>
              </div>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}
