'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { ConnectedDevice } from '../types/emt.types';
import { useConnectDevice, useLogEmtAction } from '../hooks/useEmtAnalytics';
import { Cpu, Wifi, WifiOff, RefreshCcw, Mic, Activity } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { devices: ConnectedDevice[]; }

export function EmtEquipmentWorkspace({ devices }: Props) {
  const { mutate: connectDevice } = useConnectDevice();
  const { mutate: logAction } = useLogEmtAction();

  return (
    <Card className="border-blue-500/20 shadow-glass bg-[#020406] h-full flex flex-col relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-600 via-cyan-500 to-emerald-500" />

      <CardHeader className="border-b border-white/[0.04] p-4 bg-black/40">
        <h3 className="text-[14px] font-black text-white flex items-center gap-2">
          <Cpu className="w-4 h-4 text-cyan-400" /> Equipment Integration (BLE / Wi-Fi)
        </h3>
      </CardHeader>

      <CardBody className="p-0 flex-1 overflow-y-auto flex flex-col">

        {/* Devices List */}
        <div className="p-4 grid grid-cols-1 gap-3">
          {devices.map(d => (
            <div key={d.id} className={cn('border rounded-xl p-4',
              d.status === 'Connected' ? 'bg-cyan-500/10 border-cyan-500/30' :
              d.status === 'Syncing' ? 'bg-blue-500/10 border-blue-500/30' : 'bg-white/[0.02] border-white/10'
            )}>
              <div className="flex justify-between items-start mb-3">
                 <div className="flex items-center gap-2">
                    <Activity className={cn('w-4 h-4', d.status === 'Connected' ? 'text-cyan-400' : 'text-gray-500')} />
                    <h4 className="text-[14px] font-bold text-white">{d.name}</h4>
                 </div>
                 <div className={cn('text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 px-2 py-0.5 rounded border',
                    d.status === 'Connected' ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' :
                    d.status === 'Syncing' ? 'bg-blue-500/20 text-blue-300 border-blue-500/40 animate-pulse' : 'bg-gray-800 text-gray-400 border-gray-700'
                 )}>
                    {d.status === 'Connected' && <Wifi className="w-3 h-3" />}
                    {d.status === 'Syncing' && <RefreshCcw className="w-3 h-3 animate-spin" />}
                    {d.status === 'Disconnected' && <WifiOff className="w-3 h-3" />}
                    {d.status}
                 </div>
              </div>

              {d.status !== 'Disconnected' && (
                 <div className="flex justify-between items-end mt-4">
                    <div>
                       <span className="text-[10px] text-gray-500 uppercase tracking-widest block mb-1">Last Reading Sync</span>
                       <span className="text-[16px] font-mono text-cyan-400">{d.lastReading || '---'}</span>
                    </div>
                    {d.batteryLevel && (
                       <span className={cn('text-[10px] font-bold', d.batteryLevel < 20 ? 'text-emergency-light' : 'text-success-light')}>
                          BATTERY: {d.batteryLevel}%
                       </span>
                    )}
                 </div>
              )}

              {d.status === 'Disconnected' && (
                 <Button onClick={() => connectDevice(d.id)} className="w-full mt-3 h-10 bg-white/5 border border-white/10 text-[12px] hover:bg-white/10">Initiate Pairing Protocol</Button>
              )}
            </div>
          ))}
        </div>

        {/* Rapid Logging Actions */}
        <div className="p-4 border-t border-white/5 bg-black/20 mt-auto">
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3 text-center">Fast Logging</p>
          <div className="grid grid-cols-2 gap-3">
            <Button onClick={() => logAction('O2 Flow adjusted')} className="h-12 text-[12px] font-bold bg-white/5 hover:bg-white/10 text-white border border-white/10">Log O2 Adjust</Button>
            <Button onClick={() => logAction('Suction applied')} className="h-12 text-[12px] font-bold bg-white/5 hover:bg-white/10 text-white border border-white/10">Log Suction</Button>
          </div>
          <Button className="w-full mt-3 h-12 bg-blue-500/10 text-blue-400 border border-blue-500/30 hover:bg-blue-500/20" leftIcon={<Mic className="w-4 h-4" />}>
            Voice Record Notes
          </Button>
        </div>

      </CardBody>
    </Card>
  );
}
