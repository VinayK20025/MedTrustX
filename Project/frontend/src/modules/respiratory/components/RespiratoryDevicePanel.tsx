'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { RespiratoryDevice } from '../types/respiratory.types';
import { useUpdateDeviceSettings } from '../hooks/useRespiratoryAnalytics';
import { Wind, Settings2, AlertTriangle, ShieldCheck } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { devices: RespiratoryDevice[]; }

export function RespiratoryDevicePanel({ devices }: Props) {
  const { mutate: updateSettings, isPending } = useUpdateDeviceSettings();
  const active = devices.filter(d => d.status === 'Active' || d.status === 'Alarm');

  return (
    <Card className={cn("border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col", devices.some(d => d.status === 'Alarm') && 'border-emergency/30')}>
      <CardHeader className="border-b border-white/[0.04] px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-blue-500/15"><Wind className="w-4 h-4 text-blue-400" /></div>
          <div>
            <h3 className="text-[15px] font-bold text-white tracking-wide">Ventilators & Devices</h3>
            <p className="text-[11px] text-gray-500">{active.length} active life-support units</p>
          </div>
        </div>
      </CardHeader>

      <CardBody className="p-0 flex-1 overflow-y-auto max-h-[450px]">
        <div className="divide-y divide-white/[0.03]">
          {active.map(dev => (
            <div key={dev.id} className={cn('p-5 transition-colors', dev.status === 'Alarm' ? 'bg-emergency/5 border-l-2 border-emergency' : 'hover:bg-white/[0.015]')}>
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h4 className="text-[13px] font-bold text-white flex items-center gap-2">
                    {dev.type}
                    <span className="text-[9px] font-mono text-gray-500 bg-white/5 px-1.5 py-0.5 rounded">{dev.id}</span>
                  </h4>
                  <p className="text-[11px] text-gray-500 mt-0.5">Bed: {dev.bedLocation}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className={cn('text-[9px] uppercase font-bold px-2 py-0.5 rounded tracking-wider flex items-center gap-1', 
                    dev.status === 'Alarm' ? 'bg-emergency/20 text-emergency-light animate-pulse' : 'bg-success/20 text-success-light'
                  )}>
                    {dev.status === 'Alarm' && <AlertTriangle className="w-2.5 h-2.5" />} {dev.status}
                  </span>
                </div>
              </div>
              
              <div className="bg-surface-dark border border-white/[0.04] p-3 rounded-lg mb-3">
                <div className="flex items-center justify-between mb-2 pb-2 border-b border-white/[0.04]">
                  <span className="text-[10px] text-gray-500 font-bold uppercase">Mode</span>
                  <span className="text-[12px] font-black text-blue-300">{dev.mode || 'N/A'}</span>
                </div>
                <div className="grid grid-cols-4 gap-2 text-center">
                  <div>
                    <span className="text-[9px] text-gray-500 block">FiO2</span>
                    <span className="text-sm font-bold text-white">{dev.fio2 ? `${dev.fio2}%` : '-'}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-gray-500 block">PEEP</span>
                    <span className="text-sm font-bold text-white">{dev.peep || '-'}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-gray-500 block">Vt</span>
                    <span className="text-sm font-bold text-white">{dev.tidalVolume || '-'}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-gray-500 block">RR</span>
                    <span className="text-sm font-bold text-white">{dev.respiratoryRate || '-'}</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-[9px] text-success-light flex items-center gap-1"><ShieldCheck className="w-3 h-3" /> Protocol Validated</span>
                <Button size="xs" variant="outline" className="h-7 text-[10px] text-blue-400 border-blue-500/30 hover:bg-blue-500/10 font-bold" leftIcon={<Settings2 className="w-3 h-3" />}>
                  Adjust Params
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}
