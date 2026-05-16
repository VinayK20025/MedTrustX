'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import type { Camera, CameraStatus } from '../types/cctv.types';
import { Camera as CameraIcon, Search } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { cameras: Camera[]; selectedId?: string; onSelect: (id: string) => void; }

const statusConfig: Record<CameraStatus, { dot: string; badge: string }> = {
  Online: { dot: 'bg-emerald-400', badge: 'text-emerald-400' },
  Alert: { dot: 'bg-emergency-light animate-ping', badge: 'text-emergency-light' },
  Offline: { dot: 'bg-gray-600', badge: 'text-gray-500' },
  Maintenance: { dot: 'bg-warning-light', badge: 'text-warning-light' },
};

export function CameraListPanel({ cameras, selectedId, onSelect }: Props) {
  const sorted = [...cameras].sort((a, b) => {
    const order: Record<CameraStatus, number> = { Alert: 0, Offline: 1, Maintenance: 2, Online: 3 };
    return order[a.status] - order[b.status];
  });

  return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col">
      <CardHeader className="border-b border-white/[0.04] px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded bg-purple-500/15"><CameraIcon className="w-4 h-4 text-purple-400" /></div>
          <h3 className="text-[14px] font-bold text-white tracking-wide">Cameras</h3>
        </div>
        <span className="text-[10px] text-gray-400">{cameras.filter(c => c.status === 'Online').length}/{cameras.length} Live</span>
      </CardHeader>

      {/* Search */}
      <div className="px-3 py-2 border-b border-white/[0.04]">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
          <input type="text" placeholder="Search cameras..." className="w-full bg-black/30 border border-white/10 rounded-lg pl-8 pr-3 py-1.5 text-[12px] text-white focus:outline-none focus:border-purple-500/50" />
        </div>
      </div>

      <CardBody className="p-0 flex-1 overflow-y-auto">
        <div className="divide-y divide-white/[0.03]">
          {sorted.map(cam => {
            const cfg = statusConfig[cam.status];
            return (
              <div key={cam.id} onClick={() => onSelect(cam.id)}
                className={cn('px-4 py-3 cursor-pointer transition-all group flex items-center justify-between gap-3',
                  selectedId === cam.id ? 'bg-purple-500/10 ring-1 ring-inset ring-purple-500/20' :
                  cam.status === 'Alert' ? 'bg-emergency/[0.04] hover:bg-emergency/[0.07]' :
                  cam.status === 'Offline' ? 'opacity-60 hover:opacity-80' : 'hover:bg-white/[0.02]'
                )}>
                <div className="flex items-center gap-3 min-w-0">
                  {/* Status dot */}
                  <div className="relative shrink-0">
                    <div className={cn('w-2 h-2 rounded-full', cfg.dot)} />
                    {cam.status === 'Alert' && <div className="absolute inset-0 w-2 h-2 rounded-full bg-emergency-light animate-ping opacity-60" />}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[12px] font-bold text-white truncate group-hover:text-purple-300 transition-colors">{cam.name}</p>
                    <p className="text-[10px] text-gray-500">{cam.zone} • {cam.resolution}</p>
                  </div>
                </div>
                <span className={cn('text-[9px] font-bold uppercase tracking-wider shrink-0', cfg.badge)}>{cam.status}</span>
              </div>
            );
          })}
        </div>
      </CardBody>
    </Card>
  );
}
