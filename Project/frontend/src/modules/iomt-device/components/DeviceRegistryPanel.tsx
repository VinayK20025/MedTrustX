'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Server, CheckCircle2, AlertTriangle, ShieldOff, Activity } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/utils/cn';
import type { IomtDevice } from '../types/iomt.types';

interface DeviceRegistryPanelProps {
  devices: IomtDevice[];
  activeDeviceId?: string;
  onSelectDevice: (id: string) => void;
  onApproveDevice: (id: string) => void;
}

const statusColors: Record<string, string> = {
  Active: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
  'Pending Auth': 'text-purple-400 bg-purple-500/10 border-purple-500/30',
  Offline: 'text-gray-400 bg-gray-500/10 border-gray-500/30',
  Quarantined: 'text-red-400 bg-red-500/10 border-red-500/30',
};

export const DeviceRegistryPanel: React.FC<DeviceRegistryPanelProps> = ({ devices, activeDeviceId, onSelectDevice, onApproveDevice }) => {
  return (
    <Card className="h-full flex flex-col border-white/[0.06] shadow-glass bg-surface-dark">
      <CardHeader
        title="IoMT Fleet Registry"
        icon={<Server className="w-4 h-4" />}
        action={<span className="text-[10px] bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded-full">{devices.length} Devices</span>}
      />
      <CardBody className="flex-1 overflow-y-auto p-0">
        <div className="divide-y divide-white/[0.04]">
          {devices.map(device => (
            <div
              key={device.id}
              onClick={() => onSelectDevice(device.id)}
              className={cn(
                "p-4 cursor-pointer transition-colors hover:bg-white/[0.02] border-l-2",
                activeDeviceId === device.id ? "bg-white/[0.04] border-l-indigo-500" : "border-l-transparent"
              )}
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1 mr-2">
                  <h4 className="text-sm font-medium text-white leading-snug">{device.name}</h4>
                  <p className="text-[10px] text-gray-500 font-mono mt-0.5">{device.id}</p>
                </div>
                <span className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded border shrink-0", statusColors[device.status])}>
                  {device.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-3 mb-3">
                <div className="bg-black/20 rounded p-1.5 border border-white/5 flex flex-col justify-center">
                  <p className="text-[9px] text-gray-500 uppercase">Type & Location</p>
                  <p className="text-xs font-medium text-gray-300 mt-0.5 truncate">{device.type} • {device.department}</p>
                </div>
                <div className="bg-black/20 rounded p-1.5 border border-white/5 flex flex-col justify-center">
                  <p className="text-[9px] text-gray-500 uppercase">Network</p>
                  <p className="text-xs font-mono text-gray-400 mt-0.5 truncate">{device.ipAddress}</p>
                </div>
              </div>

              <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/[0.04]">
                <div className="flex items-center gap-2">
                  {device.status === 'Active' ? <Activity className="w-3 h-3 text-emerald-400 animate-pulse" /> :
                   device.status === 'Quarantined' ? <ShieldOff className="w-3 h-3 text-red-400" /> :
                   device.status === 'Offline' ? <Server className="w-3 h-3 text-gray-500" /> :
                   <AlertTriangle className="w-3 h-3 text-purple-400" />}
                  <span className="text-[10px] text-gray-500">
                    Last Ping: {new Date(device.lastPing).toLocaleTimeString()}
                  </span>
                </div>

                {device.status === 'Pending Auth' && (
                  <Button size="sm" variant="outline" className="h-6 px-2 text-[9px] text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10" onClick={(e) => { e.stopPropagation(); onApproveDevice(device.id); }}>
                    <CheckCircle2 className="w-2.5 h-2.5 mr-1" /> Authenticate
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
};
