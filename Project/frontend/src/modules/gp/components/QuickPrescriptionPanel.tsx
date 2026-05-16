'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { QuickPrescriptionPreset } from '../types/gp.types';
import { Pill, Plus } from 'lucide-react';

interface Props { presets: QuickPrescriptionPreset[]; }

export function QuickPrescriptionPanel({ presets }: Props) {
  return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col">
      <CardHeader className="border-b border-white/[0.04] px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Pill className="w-5 h-5 text-teal-400" />
          <h3 className="text-lg font-semibold text-white tracking-wide">Quick Rx</h3>
        </div>
        <Button size="sm" variant="outline" className="h-7 text-[10px] gap-1 px-2 border-white/[0.1]"><Plus className="w-3 h-3"/> Custom</Button>
      </CardHeader>
      <CardBody className="p-4 flex-1 space-y-2 overflow-y-auto max-h-[300px]">
        {presets.map(p => (
          <div key={p.id} className="p-3 bg-white/[0.02] border border-white/[0.04] rounded-lg hover:border-teal-500/30 transition-colors cursor-pointer group">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-white group-hover:text-teal-400 transition-colors">{p.name}</span>
              <span className="text-[10px] text-gray-500">{p.duration}</span>
            </div>
            <p className="text-[11px] text-gray-300">{p.drug}</p>
            <p className="text-[10px] text-teal-300 font-mono mt-1 bg-teal-500/10 inline-block px-1.5 py-0.5 rounded">{p.dosage}</p>
          </div>
        ))}
      </CardBody>
    </Card>
  );
}
