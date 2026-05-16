'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import type { OTInstrument } from '../types/ot.types';
import { ClipboardList, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface Props { instruments: OTInstrument[]; }

export function OTInstrumentTracker({ instruments }: Props) {
  const hasMismatch = instruments.some(i => i.currentCount !== i.initialCount && i.status !== 'in_use');

  return (
    <Card className={`border shadow-glass bg-surface-light h-full flex flex-col ${hasMismatch ? 'border-emergency/50' : 'border-white/[0.06]'}`}>
      <CardHeader className={`border-b px-5 py-3 flex items-center justify-between ${hasMismatch ? 'border-emergency/20 bg-emergency/5' : 'border-white/[0.04]'}`}>
        <div className="flex items-center gap-2">
          <ClipboardList className={`w-4 h-4 ${hasMismatch ? 'text-emergency-light animate-pulse' : 'text-gray-300'}`} />
          <h3 className="text-[15px] font-semibold text-white tracking-wide">Instrument Count</h3>
        </div>
        {hasMismatch && <span className="text-[10px] font-bold bg-emergency text-white px-2 py-1 rounded animate-pulse">MISMATCH DETECTED</span>}
      </CardHeader>
      <CardBody className="p-3 flex-1 overflow-y-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/[0.04]">
              <th className="py-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Item</th>
              <th className="py-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest text-center">Initial</th>
              <th className="py-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest text-center">Current</th>
              <th className="py-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest text-right">Status</th>
            </tr>
          </thead>
          <tbody>
            {instruments.map(item => {
              const isMissing = item.currentCount !== item.initialCount && item.status !== 'in_use';
              return (
                <tr key={item.id} className={`border-b border-white/[0.02] last:border-0 ${isMissing ? 'bg-emergency/10' : ''}`}>
                  <td className="py-3 text-[13px] font-medium text-white">{item.name}</td>
                  <td className="py-3 text-[13px] text-gray-400 font-mono text-center">{item.initialCount}</td>
                  <td className={`py-3 text-[13px] font-bold font-mono text-center ${isMissing ? 'text-emergency-light' : 'text-white'}`}>{item.currentCount}</td>
                  <td className="py-3 text-right">
                    <span className={`text-[9px] uppercase font-bold px-2 py-1 rounded ${
                      item.status === 'verified' ? 'bg-success/20 text-success-light' :
                      item.status === 'in_use' ? 'bg-indigo-500/20 text-indigo-300' :
                      'bg-emergency/20 text-emergency-light'
                    }`}>
                      {item.status.replace('_', ' ')}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </CardBody>
    </Card>
  );
}
