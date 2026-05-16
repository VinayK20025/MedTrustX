'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import type { NetworkDevice, DeviceStatus } from '../types/network.types';
import { Network, Router, Wifi, Shield, PowerOff, AlertTriangle } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { devices: NetworkDevice[]; }

const statusColor: Record<DeviceStatus, string> = {
  Online: 'bg-emerald-500/20 text-emerald-400',
  Degraded: 'bg-warning/20 text-warning-light',
  Offline: 'bg-emergency/20 text-emergency-light border border-emergency/30 animate-pulse',
  Maintenance: 'bg-gray-500/20 text-gray-400',
};

const getIcon = (type: string) => {
  switch (type) {
    case 'Router': return <Router className="w-4 h-4" />;
    case 'WiFi AP': return <Wifi className="w-4 h-4" />;
    case 'Firewall': return <Shield className="w-4 h-4" />;
    default: return <Network className="w-4 h-4" />;
  }
};

export function NetworkTopologyPanel({ devices }: Props) {
  return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col">
      <CardHeader className="border-b border-white/[0.04] px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded bg-blue-500/15"><Network className="w-4 h-4 text-blue-400" /></div>
          <h3 className="text-[14px] font-bold text-white tracking-wide">Network Nodes</h3>
        </div>
      </CardHeader>
      <CardBody className="p-0 flex-1 overflow-y-auto">
        <div className="divide-y divide-white/[0.03]">
          {devices.map(dev => (
            <div key={dev.id} className="p-4 hover:bg-white/[0.02] transition-colors cursor-pointer group">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                  <div className={cn("p-1.5 rounded border border-white/5", dev.status === 'Online' ? "bg-emerald-500/10 text-emerald-400" : dev.status === 'Degraded' ? "bg-warning/10 text-warning-light" : "bg-emergency/10 text-emergency-light")}>
                    {getIcon(dev.type)}
                  </div>
                  <div>
                    <h4 className="text-[13px] font-bold text-white group-hover:text-blue-300 transition-colors flex items-center gap-1.5">
                      {dev.name}
                    </h4>
                    <p className="text-[10px] text-gray-500 font-mono mt-0.5">{dev.location}</p>
                  </div>
                </div>
                <span className={cn('text-[9px] uppercase font-bold px-2 py-0.5 rounded tracking-wider', statusColor[dev.status])}>{dev.status}</span>
              </div>
              
              <div className="grid grid-cols-3 gap-2 mt-2">
                <div className="bg-black/20 rounded p-1.5 border border-white/5">
                  <div className="text-[9px] text-gray-500 uppercase">Uptime</div>
                  <div className={cn("text-[11px] font-mono font-bold", dev.uptime < 99 ? "text-warning-light" : "text-emerald-400")}>{dev.uptime}%</div>
                </div>
                <div className="bg-black/20 rounded p-1.5 border border-white/5">
                  <div className="text-[9px] text-gray-500 uppercase">Load</div>
                  <div className={cn("text-[11px] font-mono font-bold", dev.load > 80 ? "text-emergency-light" : "text-white")}>{dev.load}%</div>
                </div>
                <div className="bg-black/20 rounded p-1.5 border border-white/5">
                  <div className="text-[9px] text-gray-500 uppercase">Latency</div>
                  <div className={cn("text-[11px] font-mono font-bold", dev.latency > 20 ? "text-warning-light" : "text-blue-300")}>{dev.latency}ms</div>
                </div>
              </div>
              
              {dev.status === 'Offline' && (
                <div className="mt-3 flex items-center justify-between text-[10px] text-emergency-light font-bold bg-emergency/10 p-2 rounded">
                   <span className="flex items-center gap-1"><PowerOff className="w-3 h-3" /> Node Unreachable</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}
